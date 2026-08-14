import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';
import { sequelize, Tenant, User, License, Role, Branch, City, Category, Product, Menu } from '../models/index.js';

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-z0-9]/g, '')
    .trim();

/** Días restantes de una licencia. Nunca negativo: 0 = vencida. */
const daysLeft = (endDate) => {
  if (!endDate) return 0;
  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
};

/**
 * Slugs que no se pueden asignar a un restaurante porque chocan con rutas
 * estáticas del frontend (que tienen prioridad sobre el segmento [tenant]).
 */
const RESERVED_SLUGS = new Set(['admin', 'app', 'home', 'public', 'api', 'nav', 'www']);

const ensureUniqueSlug = async (baseSlug) => {
  let slug    = baseSlug;
  let counter = 1;
  while (RESERVED_SLUGS.has(slug) || (await Tenant.findOne({ where: { slug } }))) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
};

export const createTenant = async ({
  establishment_name,
  admin_name,
  last_name = null,
  email,
  phone = null,
  password,
  plan = 'basic',
  license_days = 30,
  city_id = null
}) => {
  const emailExists = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (emailExists) {
    throw new AppError('El email ya está registrado en el sistema', 409);
  }

  const baseSlug = slugify(establishment_name);
  const slug     = await ensureUniqueSlug(baseSlug);

  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  if (!adminRole) throw new AppError('Rol admin no encontrado. Ejecuta los seeders.', 500);

  const password_hash = await bcrypt.hash(password, 12);

  const startDate = new Date();
  const endDate   = new Date();
  endDate.setDate(endDate.getDate() + license_days);

  const result = await sequelize.transaction(async (t) => {
    const tenant = await Tenant.create(
      { name: establishment_name, slug, active: true },
      { transaction: t }
    );

    const user = await User.create(
      {
        tenant_id:     tenant.tenant_id,
        role_id:       adminRole.role_id,
        name:          admin_name,
        last_name,
        email:         email.toLowerCase().trim(),
        phone,
        password_hash,
        active:        true,
      },
      { transaction: t }
    );

    // Crear sucursal principal automáticamente
    await Branch.create(
      {
        tenant_id: tenant.tenant_id,
        name: 'Sede Principal',
        address: 'Dirección por completar',
        active: true,
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

  return tenants.map((tenant) => {
    const plain = tenant.toJSON();
    return {
      ...plain,
      license: plain.license ? { ...plain.license, days_left: daysLeft(plain.license.end_date) } : null,
    };
  });
};

/**
 * Ficha completa de un restaurante para la consola de super admin:
 * licencia vigente, sucursales, usuarios y volumen de catálogo.
 */
export const getTenantDetail = async (tenantId) => {
  const tenant = await Tenant.findByPk(tenantId, {
    include: [
      { model: License, as: 'license', attributes: ['plan', 'status', 'start_date', 'end_date', 'grace_days'] },
      {
        model: Branch,
        as: 'branches',
        attributes: ['branch_id', 'name', 'address', 'phone_1', 'active'],
        include: [{ model: City, as: 'city', attributes: ['city_id', 'description'] }],
      },
      {
        model: User,
        as: 'users',
        attributes: ['user_id', 'name', 'last_name', 'email', 'phone', 'active', 'created_at'],
        include: [{ model: Role, as: 'role', attributes: ['role_id', 'name'] }],
      },
    ],
    order: [
      [{ model: Branch, as: 'branches' }, 'branch_id', 'ASC'],
      [{ model: User, as: 'users' }, 'created_at', 'ASC'],
    ],
  });

  if (!tenant) throw new AppError('Tenant no encontrado', 404);

  const [categories, products, menus] = await Promise.all([
    Category.count({ where: { tenant_id: tenantId } }),
    Product.count({ where: { tenant_id: tenantId } }),
    Menu.count({ where: { tenant_id: tenantId } }),
  ]);

  const plain = tenant.toJSON();

  return {
    ...plain,
    license: plain.license ? { ...plain.license, days_left: daysLeft(plain.license.end_date) } : null,
    stats: { categories, products, menus, branches: plain.branches.length, users: plain.users.length },
  };
};

/**
 * Actualiza los datos de identidad del restaurante.
 * El slug no se toca: ya está impreso en los códigos QR que hay en la calle.
 */
export const updateTenant = async (tenantId, { name, logo_url }) => {
  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant) throw new AppError('Tenant no encontrado', 404);

  const changes = {};
  if (name !== undefined) {
    if (!name.trim()) throw new AppError('El nombre no puede estar vacío', 422);
    changes.name = name.trim();
  }
  if (logo_url !== undefined) changes.logo_url = logo_url;

  await tenant.update(changes);
  return { tenant_id: tenant.tenant_id, name: tenant.name, logo_url: tenant.logo_url, slug: tenant.slug };
};

export const setTenantStatus = async (tenantId, active) => {
  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant) throw new AppError('Tenant no encontrado', 404);

  await tenant.update({ active });
  return { tenant_id: tenantId, active };
};

/**
 * Renueva la licencia acumulando días.
 *
 * Si el restaurante renueva antes de vencer, los días nuevos se suman a los que
 * le quedaban: pagar por anticipado no puede recortarle tiempo de uso. Si ya
 * venció, el conteo arranca hoy — los días transcurridos sin pagar no se regalan.
 */
export const renewLicense = async (tenantId, { plan, license_days }) => {
  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant) throw new AppError('Tenant no encontrado', 404);

  const days = Number(license_days);
  if (!Number.isInteger(days) || days < 1) {
    throw new AppError('license_days debe ser un entero mayor a 0', 422);
  }

  const now      = new Date();
  const current  = await License.findOne({ where: { tenant_id: tenantId } });
  const isActive = current && new Date(current.end_date) > now;

  // Punto de partida: el vencimiento vigente si aún no pasó, o ahora mismo.
  const endDate = new Date(isActive ? current.end_date : now);
  endDate.setDate(endDate.getDate() + days);

  const startDate = isActive ? current.start_date : now;
  const values = {
    tenant_id:  tenantId,
    name:       plan,
    plan,
    start_date: startDate,
    end_date:   endDate,
    status:     'active',
  };

  if (current) {
    await current.update(values);
  } else {
    await License.create({ ...values, grace_days: 7 });
  }

  return {
    tenant_id:        tenantId,
    plan,
    start_date:       startDate,
    license_end_date: endDate,
    days_left:        daysLeft(endDate),
    days_added:       days,
    accumulated:      Boolean(isActive),
  };
};

export default {
  createTenant,
  listTenants,
  getTenantDetail,
  updateTenant,
  setTenantStatus,
  renewLicense,
};
