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

  if (!menu) throw { status: 404, message: 'Menú no encontrado' };

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
  if (!menu) throw { status: 404, message: 'Menú no encontrado' };

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
    throw { status: 500, message: 'Error actualizando la estructura del menú' };
  }
};

export default { listMenus, getMenuDetail, createMenu, updateMenuStructure };
