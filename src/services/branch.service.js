import { Branch, City, User } from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';

export const listBranches = async (tenantId) => {
  return await Branch.findAll({
    where: { tenant_id: tenantId },
    include: [
      { model: City, as: 'city', attributes: ['description'] },
      { model: User, as: 'manager', attributes: ['name', 'email'] },
    ],
    order: [['name', 'ASC']],
  });
};

export const updateBranch = async (tenantId, branchId, data, actorId, ipAddress) => {
  const branch = await Branch.findOne({ where: { branch_id: branchId, tenant_id: tenantId } });
  if (!branch) throw { status: 404, message: 'Sucursal no encontrada' };

  // Filtrar los campos que realmente se permiten actualizar
  const { name, address, city_id, phone_1, whatsapp_number, instagram_url, facebook_url, tiktok_url, active } = data;

  const oldValues = {
    name: branch.name, address: branch.address, city_id: branch.city_id,
    phone_1: branch.phone_1, whatsapp_number: branch.whatsapp_number,
    instagram_url: branch.instagram_url, facebook_url: branch.facebook_url, tiktok_url: branch.tiktok_url,
    active: branch.active
  };

  const newValues = {
    name: name !== undefined ? name : branch.name,
    address: address !== undefined ? address : branch.address,
    city_id: city_id !== undefined ? city_id : branch.city_id,
    phone_1: phone_1 !== undefined ? phone_1 : branch.phone_1,
    whatsapp_number: whatsapp_number !== undefined ? whatsapp_number : branch.whatsapp_number,
    instagram_url: instagram_url !== undefined ? instagram_url : branch.instagram_url,
    facebook_url: facebook_url !== undefined ? facebook_url : branch.facebook_url,
    tiktok_url: tiktok_url !== undefined ? tiktok_url : branch.tiktok_url,
    active: active !== undefined ? active : branch.active,
  };

  await branch.update(newValues);

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'branch',
    record_id: branch.branch_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: newValues,
    ip_address: ipAddress,
  });

  return branch;
};

export const assignManager = async (tenantId, branchId, managerId, actorId, ipAddress) => {
  const branch = await Branch.findOne({ where: { branch_id: branchId, tenant_id: tenantId } });
  if (!branch) throw { status: 404, message: 'Sucursal no encontrada' };

  if (managerId !== null) {
    const user = await User.findOne({ where: { user_id: managerId, tenant_id: tenantId } });
    if (!user) throw { status: 400, message: 'Usuario manager no válido para este tenant' };
  }

  const oldValues = { manager_id: branch.manager_id };
  await branch.update({ manager_id: managerId });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'branch',
    record_id: branch.branch_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: { manager_id: managerId },
    ip_address: ipAddress,
  });

  return { branch_id: branch.branch_id, manager_id: managerId };
};

export default { listBranches, updateBranch, assignManager };
