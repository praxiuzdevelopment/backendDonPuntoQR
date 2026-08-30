import AppError from '../utils/AppError.js';
import { sequelize, Menu, MenuCategory, MenuProduct, Category, Product, Template } from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';
import { findOverlappingMenus, findActiveSeasonalMenus } from './menuResolver.js';
import { assertBranchInTenant } from '../utils/branchScope.js';

/**
 * Menús del restaurante, marcando cuál se está sirviendo ahora mismo.
 *
 * `serving_now` es lo que resolverían los códigos QR automáticos en este
 * instante. Sin ese dato el restaurante no tiene forma de saber que una
 * temporada tomó el control de sus mesas.
 */
export const listMenus = async (tenantId) => {
  const [menus, seasonal] = await Promise.all([
    Menu.findAll({
      where: { tenant_id: tenantId },
      include: [{ model: Template, as: 'template', attributes: ['name', 'preview_image'] }],
      order: [['created_at', 'DESC']],
    }),
    // La gestión resume el restaurante entero, así que aquí sí cuentan las
    // temporadas de cualquier sede: al restaurante le interesa ver que una está
    // vigente aunque sólo afecte a una sucursal.
    findActiveSeasonalMenus(tenantId, { anyBranch: true }),
  ]);

  // La temporada vigente manda sobre el principal; si no hay, manda el principal.
  const servingId =
    seasonal[0]?.menu_id ?? menus.find((m) => m.is_default && m.active)?.menu_id ?? null;

  return menus.map((menu) => ({
    ...menu.toJSON(),
    serving_now: menu.menu_id === servingId,
  }));
};

/**
 * Designa el menú principal del restaurante.
 *
 * Se hace en una transacción porque hay un índice único que sólo permite un
 * principal por restaurante: si no se quita el anterior primero, la operación
 * falla.
 */
export const setDefaultMenu = async (tenantId, menuId, actorId, ipAddress) => {
  const menu = await Menu.findOne({ where: { menu_id: menuId, tenant_id: tenantId } });
  if (!menu) throw new AppError('Menú no encontrado', 404);

  if (menu.temporal) {
    throw new AppError(
      'Un menú de temporada no puede ser el principal: el principal es la carta a la que se vuelve cuando ninguna temporada está vigente',
      422
    );
  }
  if (!menu.active) {
    throw new AppError('Un menú inactivo no puede ser el principal', 422);
  }
  if (menu.branch_id !== null) {
    throw new AppError(
      'Un menú de una sola sede no puede ser el principal del restaurante: las demás sedes se quedarían sin carta a la que volver',
      422
    );
  }

  await sequelize.transaction(async (transaction) => {
    await Menu.update(
      { is_default: false },
      { where: { tenant_id: tenantId, is_default: true }, transaction }
    );
    await menu.update({ is_default: true }, { transaction });
  });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'menu',
    record_id: menu.menu_id,
    action: 'SET_DEFAULT',
    new_values: { is_default: true },
    ip_address: ipAddress,
  });

  return { menu_id: menu.menu_id, name: menu.name, is_default: true };
};

export const getMenuDetail = async (tenantId, menuId) => {
  // Obtenemos el menú con sus categorías y productos
  const menu = await Menu.findOne({
    where: { menu_id: menuId, tenant_id: tenantId },
    include: [
      { model: Template, as: 'template' },
      {
        model: Category,
        as: 'categories',
        through: { attributes: ['display_order'] },
      },
      {
        model: Product,
        as: 'products',
        through: { attributes: ['display_order', 'show_description', 'featured'] },
      }
    ]
  });

  if (!menu) throw new AppError('Menú no encontrado', 404);

  // Re-estructuramos la respuesta para que los productos queden dentro de las categorías correspondientes
  const menuJSON = menu.toJSON();

  // Ordenar categorías por display_order
  menuJSON.categories.sort((a, b) => a.MenuCategory.display_order - b.MenuCategory.display_order);

  // Ordenar productos por display_order y agruparlos
  menuJSON.products.sort((a, b) => a.MenuProduct.display_order - b.MenuProduct.display_order);

  const structuredSections = menuJSON.categories.map(category => {
    return {
      category_id: category.category_id,
      name: category.name,
      description: category.description,
      display_order: category.MenuCategory.display_order,
      products: menuJSON.products.filter(p => p.category_id === category.category_id).map(p => ({
        product_id: p.product_id,
        name: p.name,
        description: p.description,
        price: p.price,
        image_url: p.image_url,
        available: p.available,
        is_combo: p.is_combo,
        display_order: p.MenuProduct.display_order,
        show_description: p.MenuProduct.show_description,
        featured: p.MenuProduct.featured
      }))
    };
  });

  return {
    basics: {
      menu_id: menuJSON.menu_id,
      name: menuJSON.name,
      temporal: menuJSON.temporal,
      start_date: menuJSON.start_date,
      end_date: menuJSON.end_date,
      active: menuJSON.active
    },
    appearance: {
      template_id: menuJSON.template_id,
      primary_color: menuJSON.primary_color,
      secondary_color: menuJSON.secondary_color,
      image_position: menuJSON.image_position,
      order_criteria: menuJSON.order_criteria
    },
    sections: structuredSections
  };
};

export const createMenu = async (tenantId, data, actorId, ipAddress) => {
  const { name, template_id, primary_color, secondary_color, order_criteria, temporal, start_date, end_date, branch_id } = data;

  if (temporal && (!start_date || !end_date)) {
    throw new AppError('Un menú de temporada necesita fecha de inicio y de fin', 422);
  }
  if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
    throw new AppError('La fecha de fin no puede ser anterior a la de inicio', 422);
  }

  // Un menú puede acotarse a una sede. Se valida que sea del restaurante antes
  // de guardarla: el id llega del cliente.
  const branch = await assertBranchInTenant(tenantId, branch_id);

  // El primer menú del restaurante es su principal: así un restaurante de una
  // sola sede no tiene que configurar nada para que sus QR funcionen. Sólo
  // cuenta como principal si vale para todas las sedes.
  const existing = await Menu.count({ where: { tenant_id: tenantId } });
  const isDefault = existing === 0 && branch === null;

  const menu = await Menu.create({
    tenant_id: tenantId,
    branch_id: branch?.branch_id ?? null,
    template_id,
    name,
    primary_color,
    secondary_color,
    order_criteria: order_criteria || 'custom',
    is_default: isDefault,
    temporal: temporal || false,
    start_date: start_date || null,
    end_date: end_date || null,
    active: true
  });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'menu',
    record_id: menu.menu_id,
    action: 'INSERT',
    new_values: { name, template_id, branch_id: menu.branch_id },
    ip_address: ipAddress,
  });

  return { menu, warnings: await buildScheduleWarnings(tenantId, menu) };
};

/**
 * Avisos sobre el calendario de un menú de temporada.
 *
 * Nunca bloquean: el restaurante puede tener razones para solapar temporadas.
 * Pero si se pisan, el código QR automático sólo puede servir una, así que la
 * otra necesitará el suyo propio.
 */
export const buildScheduleWarnings = async (tenantId, menu) => {
  if (!menu.temporal || !menu.start_date || !menu.end_date) return [];

  const overlapping = await findOverlappingMenus(tenantId, {
    start_date: menu.start_date,
    end_date: menu.end_date,
    branch_id: menu.branch_id ?? null,
    excludeMenuId: menu.menu_id,
  });

  if (overlapping.length === 0) return [];

  return [
    {
      code: 'OVERLAPPING_SEASON',
      message:
        `Las fechas se cruzan con ${overlapping.map((m) => `"${m.name}"`).join(', ')}. ` +
        'El código QR que sigue al menú vigente sólo puede mostrar uno, así que este menú ' +
        'necesitará su propio código QR para ser accesible.',
      menus: overlapping.map((m) => ({
        menu_id: m.menu_id,
        name: m.name,
        start_date: m.start_date,
        end_date: m.end_date,
      })),
    },
  ];
};

export const updateMenuStructure = async (tenantId, menuId, sections, actorId, ipAddress) => {
  const menu = await Menu.findOne({ where: { menu_id: menuId, tenant_id: tenantId } });
  if (!menu) throw new AppError('Menú no encontrado', 404);

  // Ejecución Transaccional: Borrar asociaciones viejas y crear nuevas
  const transaction = await sequelize.transaction();

  try {
    await MenuCategory.destroy({ where: { menu_id: menuId }, transaction });
    await MenuProduct.destroy({ where: { menu_id: menuId }, transaction });

    const menuCategoriesToInsert = [];
    const menuProductsToInsert = [];

    sections.forEach((section, catIndex) => {
      menuCategoriesToInsert.push({
        menu_id: menuId,
        category_id: section.category_id,
        display_order: catIndex + 1,
      });

      if (section.products && Array.isArray(section.products)) {
        section.products.forEach((prod, prodIndex) => {
          menuProductsToInsert.push({
            menu_id: menuId,
            product_id: prod.product_id,
            display_order: prodIndex + 1,
            show_description: prod.show_description !== false,
            featured: prod.featured === true,
          });
        });
      }
    });

    if (menuCategoriesToInsert.length > 0) {
      await MenuCategory.bulkCreate(menuCategoriesToInsert, { transaction });
    }
    
    if (menuProductsToInsert.length > 0) {
      await MenuProduct.bulkCreate(menuProductsToInsert, { transaction });
    }

    await transaction.commit();

    await logAction({
      tenant_id: tenantId,
      user_id: actorId,
      table_name: 'menu',
      record_id: menuId,
      action: 'UPDATE_STRUCTURE',
      new_values: { categories_count: menuCategoriesToInsert.length, products_count: menuProductsToInsert.length },
      ip_address: ipAddress,
    });

    return { success: true, message: 'Estructura del menú actualizada correctamente' };
  } catch (error) {
    await transaction.rollback();
    console.error('Error in updateMenuStructure transaction:', error);
    throw new AppError('Error actualizando la estructura del menú', 500);
  }
};


/**
 * Menú en el formato de renderizado (mismo contrato que la vista pública).
 * Alimenta la previsualización del panel sin necesidad de un QR.
 */
export const getMenuForRender = async (tenantId, menuId) => {
  const { Tenant, Branch } = await import('../models/index.js');
  const { presentMenu, menuRenderInclude, branchRenderInclude } = await import('./menuPresenter.js');

  const menu = await Menu.findOne({
    where: { menu_id: menuId, tenant_id: tenantId },
    include: menuRenderInclude,
  });
  if (!menu) throw new AppError('Menú no encontrado', 404);

  const tenant = await Tenant.findByPk(tenantId);
  const branch = await Branch.findOne({
    where: { tenant_id: tenantId, active: true },
    include: branchRenderInclude,
    order: [['branch_id', 'ASC']],
  });

  return presentMenu({ menu, tenant, branch });
};



/**
 * Actualiza los datos propios del menú (no su estructura).
 * La estructura -categorias y productos- va por updateMenuStructure.
 */
export const updateMenu = async (tenantId, menuId, payload, actorId, ipAddress) => {
  const menu = await Menu.findOne({ where: { menu_id: menuId, tenant_id: tenantId } });
  if (!menu) throw new AppError('Menú no encontrado', 404);

  const allowed = [
    'name', 'template_id', 'primary_color', 'secondary_color',
    'image_position', 'order_criteria', 'temporal', 'start_date', 'end_date', 'active',
    'branch_id',
  ];
  const changes = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) changes[key] = payload[key];
  }

  if (changes.branch_id !== undefined) {
    const branch = await assertBranchInTenant(tenantId, changes.branch_id);
    changes.branch_id = branch?.branch_id ?? null;

    // El principal es la carta a la que vuelve todo el restaurante cuando no
    // hay temporada vigente: si se acotara a una sede, las demás se quedarían
    // sin carta a la que volver.
    if (changes.branch_id !== null && menu.is_default) {
      throw new AppError('El menú principal del restaurante no puede acotarse a una sede', 422);
    }
  }

  if (changes.name !== undefined && !String(changes.name).trim()) {
    throw new AppError('El nombre del menú es requerido', 422);
  }
  if (changes.temporal && (!changes.start_date || !changes.end_date)) {
    throw new AppError('Un menú de temporada necesita fecha de inicio y de fin', 422);
  }
  if (changes.start_date && changes.end_date && new Date(changes.end_date) < new Date(changes.start_date)) {
    throw new AppError('La fecha de fin no puede ser anterior a la de inicio', 422);
  }

  const oldValues = { name: menu.name, template_id: menu.template_id, active: menu.active };
  await menu.update(changes);

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'menu',
    record_id: menu.menu_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: changes,
    ip_address: ipAddress,
  });

  return { menu, warnings: await buildScheduleWarnings(tenantId, menu) };
};

export default {
  listMenus,
  getMenuDetail,
  createMenu,
  updateMenu,
  updateMenuStructure,
  getMenuForRender,
  buildScheduleWarnings,
  setDefaultMenu,
};
