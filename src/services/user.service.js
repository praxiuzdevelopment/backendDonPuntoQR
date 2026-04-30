import bcrypt from 'bcryptjs';
import { User, Role } from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';

export const listUsers = async (tenantId) => {
  return await User.findAll({
    where: { tenant_id: tenantId },
    include: [{ model: Role, as: 'role', attributes: ['name'] }],
    order: [['created_at', 'DESC']],
  });
};

export const createUser = async (tenantId, { name, email, password, role_id }, actorId, ipAddress) => {
  const emailExists = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (emailExists) {
    throw { status: 409, message: 'El email ya está registrado' };
  }

  // Prevent creating super_admin
  const role = await Role.findByPk(role_id);
  if (!role || role.name === 'super_admin') {
    throw { status: 400, message: 'Rol inválido' };
  }

  const password_hash = await bcrypt.hash(password, 12);

  const user = await User.create({
    tenant_id: tenantId,
    role_id,
    name,
    email: email.toLowerCase().trim(),
    password_hash,
    active: true,
  });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'user',
    record_id: user.user_id,
    action: 'INSERT',
    new_values: { name, email, role_id },
    ip_address: ipAddress,
  });

  const { password_hash: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

export const updateUser = async (tenantId, userId, { name, role_id }, actorId, ipAddress) => {
  const user = await User.findOne({ where: { user_id: userId, tenant_id: tenantId } });
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };

  if (role_id) {
    const role = await Role.findByPk(role_id);
    if (!role || role.name === 'super_admin') {
      throw { status: 400, message: 'Rol inválido' };
    }
  }

  const oldValues = { name: user.name, role_id: user.role_id };
  await user.update({ name, role_id });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'user',
    record_id: user.user_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: { name: user.name, role_id: user.role_id },
    ip_address: ipAddress,
  });

  return user;
};

export const toggleUserStatus = async (tenantId, userId, active, actorId, ipAddress) => {
  const user = await User.findOne({ where: { user_id: userId, tenant_id: tenantId } });
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };

  const oldValues = { active: user.active };
  await user.update({ active });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'user',
    record_id: user.user_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: { active },
    ip_address: ipAddress,
  });

  return { user_id: user.user_id, active };
};

export default { listUsers, createUser, updateUser, toggleUserStatus };
