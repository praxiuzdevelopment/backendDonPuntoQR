import AppError from '../utils/AppError.js';
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

export const getUserById = async (tenantId, userId) => {
  const user = await User.findOne({
    where: { user_id: userId, tenant_id: tenantId },
    include: [{ model: Role, as: 'role', attributes: ['name'] }],
  });
  if (!user) throw new AppError('Usuario no encontrado', 404);
  return user;
};

export const createUser = async (tenantId, { name, last_name, email, phone, password, role_id, active = true }, actorId, ipAddress) => {
  const emailExists = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (emailExists) {
    throw new AppError('El email ya está registrado', 409);
  }

  // Prevent creating super_admin
  const role = await Role.findByPk(role_id);
  if (!role || role.name === 'super_admin') {
    throw new AppError('Rol inválido', 400);
  }

  const password_hash = await bcrypt.hash(password, 12);

  const user = await User.create({
    tenant_id: tenantId,
    role_id,
    name,
    last_name,
    email: email.toLowerCase().trim(),
    phone,
    password_hash,
    active,
  });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'user',
    record_id: user.user_id,
    action: 'INSERT',
    new_values: { name, last_name, email, phone, role_id, active },
    ip_address: ipAddress,
  });

  const { password_hash: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

export const updateUser = async (tenantId, userId, { name, last_name, email, phone, role_id, active }, actorId, ipAddress) => {
  const user = await User.findOne({ where: { user_id: userId, tenant_id: tenantId } });
  if (!user) throw new AppError('Usuario no encontrado', 404);

  if (role_id) {
    const role = await Role.findByPk(role_id);
    if (!role || role.name === 'super_admin') {
      throw new AppError('Rol inválido', 400);
    }
  }

  if (email && email.toLowerCase().trim() !== user.email) {
    const emailExists = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (emailExists) throw new AppError('El email ya está en uso', 409);
  }

  const oldValues = { name: user.name, last_name: user.last_name, email: user.email, phone: user.phone, role_id: user.role_id, active: user.active };
  
  const newValues = {
    name:      name !== undefined ? name : user.name,
    last_name: last_name !== undefined ? last_name : user.last_name,
    email:     email !== undefined ? email.toLowerCase().trim() : user.email,
    phone:     phone !== undefined ? phone : user.phone,
    role_id:   role_id !== undefined ? role_id : user.role_id,
    active:    active !== undefined ? active : user.active,
  };

  await user.update(newValues);

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'user',
    record_id: user.user_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: newValues,
    ip_address: ipAddress,
  });

  return user;
};

export const toggleUserStatus = async (tenantId, userId, active, actorId, ipAddress) => {
  const user = await User.findOne({ where: { user_id: userId, tenant_id: tenantId } });
  if (!user) throw new AppError('Usuario no encontrado', 404);

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
