import { Category } from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';

export const listCategories = async (tenantId) => {
  return await Category.findAll({
    where: { tenant_id: tenantId },
    order: [['name', 'ASC']],
  });
};

export const createCategory = async (tenantId, { name, description }, actorId, ipAddress) => {
  const category = await Category.create({
    tenant_id: tenantId,
    name,
    description,
    active: true,
  });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'category',
    record_id: category.category_id,
    action: 'INSERT',
    new_values: { name, description },
    ip_address: ipAddress,
  });

  return category;
};

export const updateCategory = async (tenantId, categoryId, { name, description }, actorId, ipAddress) => {
  const category = await Category.findOne({ where: { category_id: categoryId, tenant_id: tenantId } });
  if (!category) throw { status: 404, message: 'Categoría no encontrada' };

  const oldValues = { name: category.name, description: category.description };
  await category.update({ name, description });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'category',
    record_id: category.category_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: { name, description },
    ip_address: ipAddress,
  });

  return category;
};

export const toggleCategoryStatus = async (tenantId, categoryId, active, actorId, ipAddress) => {
  const category = await Category.findOne({ where: { category_id: categoryId, tenant_id: tenantId } });
  if (!category) throw { status: 404, message: 'Categoría no encontrada' };

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

export default { listCategories, createCategory, updateCategory, toggleCategoryStatus };
