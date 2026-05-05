import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Tenant, License, Role } from '../models/index.js';

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
      { model: Tenant, as: 'tenant', attributes: ['name', 'slug'] },
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

  const role        = user.role;
  const token       = generateToken(user, role);
  const licenseData = await getLicenseData(user.tenant_id);

  return {
    restaurant_name: user.tenant?.name || 'DonPunto Admin',
    user:            user.name,
    role:            user.role_id,
    token,
    license_days:    licenseData.days,
    license_end_date: licenseData.end_date,
    slug:            user.tenant?.slug || null,
  };
};

export default { login, generateToken, getLicenseData };
