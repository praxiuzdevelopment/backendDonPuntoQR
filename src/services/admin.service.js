import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';
import { sequelize, Tenant, User, License, Role } from '../models/index.js';

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .trim()
    .replaceAll(/\s+/g, '-');

const ensureUniqueSlug = async (baseSlug) => {
  let slug    = baseSlug;
  let counter = 1;
  while (await Tenant.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
};

export const createTenant = async ({ name, email, password, plan = 'basic', license_days = 30, city_id = null }) => {
  const emailExists = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (emailExists) {
    throw new AppError('El email ya está registrado en el sistema', 409);
  }

  const baseSlug = slugify(name);
  const slug     = await ensureUniqueSlug(baseSlug);

  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  if (!adminRole) throw new AppError('Rol admin no encontrado. Ejecuta los seeders.', 500);

  const password_hash = await bcrypt.hash(password, 12);

  const startDate = new Date();
  const endDate   = new Date();
  endDate.setDate(endDate.getDate() + license_days);

  const result = await sequelize.transaction(async (t) => {
    const tenant = await Tenant.create({ name, slug, active: true }, { transaction: t });

    const user = await User.create(
      {
        tenant_id:     tenant.tenant_id,
        role_id:       adminRole.role_id,
        name,
        email:         email.toLowerCase().trim(),
        password_hash,
        active:        true,
      },
      { transaction: t }
    );

    const license = await License.create(
      {
        tenant_id:  tenant.tenant_id,
        name:       plan,
        plan,
        start_date: startDate,
        end_date:   endDate,
        status:     'active',
        grace_days: 7,
      },
      { transaction: t }
    );

    return {
      tenant_id:        tenant.tenant_id,
      user_id:          user.user_id,
      slug:             tenant.slug,
      license_end_date: license.end_date,
    };
  });

  return result;
};

export const listTenants = async () => {
  const tenants = await Tenant.findAll({
    include: [
      { model: License, as: 'license', attributes: ['plan', 'status', 'end_date'] },
    ],
    order: [['created_at', 'DESC']],
  });
  return tenants;
};

export const setTenantStatus = async (tenantId, active) => {
  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant) throw new AppError('Tenant no encontrado', 404);

  await tenant.update({ active });
  return { tenant_id: tenantId, active };
};

export const renewLicense = async (tenantId, { plan, license_days }) => {
  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant) throw new AppError('Tenant no encontrado', 404);

  const startDate = new Date();
  const endDate   = new Date();
  endDate.setDate(endDate.getDate() + license_days);

  await License.upsert({
    tenant_id:  tenantId,
    name:       plan,
    plan,
    start_date: startDate,
    end_date:   endDate,
    status:     'active',
  });

  return { tenant_id: tenantId, plan, license_end_date: endDate };
};

export default { createTenant, listTenants, setTenantStatus, renewLicense };
