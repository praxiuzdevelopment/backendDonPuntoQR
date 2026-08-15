import AppError from '../utils/AppError.js';
import { sequelize, Menu, MenuCategory, MenuProduct, Category, Product, Template } from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';

export const listMenus = async (tenantId) => {
  return await Menu.findAll({
    where: { tenant_id: tenantId },
    include: [{ model: Template, as: 'template', attributes: ['name', 'preview_image'] }],
    order: [['created_at', 'DESC']],
  });
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
  const { name, template_id, primary_color, secondary_color, temporal, start_date, end_date } = data;

  const menu = await Menu.create({
    tenant_id: tenantId,
    template_id,
    name,
    primary_color,
    secondary_color,
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
    new_values: { name, template_id },
    ip_address: ipAddress,
  });

  return menu;
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
  ];
  const changes = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) changes[key] = payload[key];
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

  return menu;
};

export default { listMenus, getMenuDetail, createMenu, updateMenu, updateMenuStructure, getMenuForRender };