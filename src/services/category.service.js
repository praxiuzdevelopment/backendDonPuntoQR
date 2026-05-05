import AppError from '../utils/AppError.js';
import { Category } from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';

export const listCategories = async (tenantId) => {
  return await Category.findAll({
    where: { tenant_id: tenantId },
    order: [['sort_order', 'ASC'], ['name', 'ASC']],
  });
};

export const getCategoryById = async (tenantId, categoryId) => {
  const category = await Category.findOne({ where: { category_id: categoryId, tenant_id: tenantId } });
  if (!category) throw new AppError('Categoría no encontrada', 404);
  return category;
};

export const createCategory = async (tenantId, { name, description, sort_order = 0, active = true }, actorId, ipAddress) => {
  const category = await Category.create({
    tenant_id: tenantId,
    name,
    description,
    sort_order,
    active,
  });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'category',
    record_id: category.category_id,
    action: 'INSERT',
    new_values: { name, description, sort_order, active },
    ip_address: ipAddress,
  });

  return category;
};

export const updateCategory = async (tenantId, categoryId, { name, description, sort_order }, actorId, ipAddress) => {
  const category = await Category.findOne({ where: { category_id: categoryId, tenant_id: tenantId } });
  if (!category) throw new AppError('Categoría no encontrada', 404);

  const oldValues = { name: category.name, description: category.description, sort_order: category.sort_order };
  
  await category.update({
    name: name !== undefined ? name : category.name,
    description: description !== undefined ? description : category.description,
    sort_order: sort_order !== undefined ? sort_order : category.sort_order,
  });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'category',
    record_id: category.category_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: { name: category.name, description: category.description, sort_order: category.sort_order },
    ip_address: ipAddress,
  });

  return category;
};

export const toggleCategoryStatus = async (tenantId, categoryId, active, actorId, ipAddress) => {
  const category = await Category.findOne({ where: { category_id: categoryId, tenant_id: tenantId } });
  if (!category) throw new AppError('Categoría no encontrada', 404);

  const oldValues = { active: category.active };
  await category.update({ active });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'category',
    record_id: category.category_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: { active },
    ip_address: ipAddress,
  });

  return { category_id: category.category_id, active };
};

export default { listCategories, getCategoryById, createCategory, updateCategory, toggleCategoryStatus };
