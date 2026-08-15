import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Tenant, License, Role, Branch } from '../models/index.js';
import { evaluateService, SERVICE_BLOCK_CODES } from '../utils/license.js';

export const generateToken = (user, role, tenantSlug = null) => {
  return jwt.sign(
    {
      user_id:   user.user_id,
      tenant_id: user.tenant_id || null,
      role_id:   user.role_id,
      role:      role.name,
      email:     user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

export const getLicenseData = async (tenantId) => {
  if (!tenantId) return { days: null, end_date: null };

  const license = await License.findOne({ where: { tenant_id: tenantId } });
  if (!license) return { days: 0, end_date: null };

  const today = new Date();
  const end   = new Date(license.end_date);
  const diff  = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return {
    days: Math.max(diff, 0),
    end_date: license.end_date,
  };
};

export const login = async ({ email, password }) => {
  const user = await User.scope('withPassword').findOne({
    where: { email: email.toLowerCase().trim(), active: true },
    include: [
      { model: Tenant, as: 'tenant', attributes: ['name', 'slug', 'active'] },
      { model: Role,   as: 'role',   attributes: ['name'] },
    ],
  });

  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new AppError('Credenciales inválidas', 401);
  }

  // El staff de DonPunto no tiene tenant ni licencia, así que nunca se bloquea.
  if (user.tenant_id) {
    const license = await License.findOne({ where: { tenant_id: user.tenant_id } });
    const service = evaluateService(user.tenant, license);

    if (service.blocked) {
      throw new AppError(
        service.code === SERVICE_BLOCK_CODES.TENANT_SUSPENDED
          ? 'La cuenta de este restaurante está suspendida'
          : 'El servicio está inactivo por falta de pago',
        403,
        {
          code: service.code,
          details: {
            restaurant_name: user.tenant?.name || null,
            end_date:        service.end_date,
            days_overdue:    service.days_overdue,
          },
        }
      );
    }
  }

  const role        = user.role;
  const token       = generateToken(user, role);
  const licenseData = await getLicenseData(user.tenant_id);
  const branch      = user.tenant_id ? await Branch.findOne({ where: { tenant_id: user.tenant_id } }) : null;

  return {
    restaurant_name: user.tenant?.name || 'DonPunto Admin',
    user:            user.name,
    role:            user.role_id,
    role_name:       role.name,
    is_super_admin:  user.tenant_id === null,
    token,
    license_days:    licenseData.days,
    license_end_date: licenseData.end_date,
    slug:            user.tenant?.slug || null,
    branch_id:       branch?.branch_id || null,
  };
};

export default { login, generateToken, getLicenseData };
