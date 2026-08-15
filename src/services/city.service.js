import { Op, fn, col, where as sqWhere } from 'sequelize';
import AppError from '../utils/AppError.js';
import { City, Branch } from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * Busca una ciudad por nombre sin distinguir mayúsculas ni espacios sobrantes.
 * Evita terminar con "Cali", "cali" y "CALI" como tres ciudades distintas.
 */
const findByName = async (description, excludeCityId = null) => {
  const conditions = [
    sqWhere(fn('lower', col('description')), description.trim().toLowerCase()),
  ];
  if (excludeCityId) conditions.push({ city_id: { [Op.ne]: excludeCityId } });

  return City.findOne({ where: { [Op.and]: conditions } });
};

/**
 * @param {boolean} includeInactive  El super admin las ve todas; el resto de la
 *                                   plataforma sólo las activas, porque alimenta
 *                                   el selector de ciudad de las sucursales.
 */
export const listCities = async ({ includeInactive = false } = {}) => {
  return City.findAll({
    where: includeInactive ? undefined : { active: true },
    order: [['description', 'ASC']],
  });
};

/** Igual que listCities pero con cuántas sucursales usan cada ciudad. */
export const listCitiesWithUsage = async () => {
  const cities = await City.findAll({ order: [['description', 'ASC']] });

  const usage = await Branch.findAll({
    attributes: ['city_id', [fn('COUNT', col('branch_id')), 'total']],
    group: ['city_id'],
    raw: true,
  });

  const usageByCity = new Map(usage.map((row) => [row.city_id, Number(row.total)]));

  return cities.map((city) => ({
    ...city.toJSON(),
    branches_count: usageByCity.get(city.city_id) ?? 0,
  }));
};

export const getCityById = async (cityId) => {
  const city = await City.findOne({ where: { city_id: cityId } });
  if (!city) throw new AppError('Ciudad no encontrada', 404);
  return city;
};

export const createCity = async ({ description }, actorId, ipAddress) => {
  if (!description || description.trim() === '') {
    throw new AppError('El nombre de la ciudad es requerido', 422);
  }

  const duplicate = await findByName(description);
  if (duplicate) {
    throw new AppError(`La ciudad "${duplicate.description}" ya existe`, 409);
  }

  const city = await City.create({
    description: description.trim(),
    active: true,
  });

  await logAction({
    tenant_id: null,
    user_id: actorId,
    table_name: 'city',
    record_id: city.city_id,
    action: 'INSERT',
    new_values: { description: city.description },
    ip_address: ipAddress,
  });

  return city;
};

export const updateCity = async (cityId, { description, active }, actorId, ipAddress) => {
  const city = await City.findOne({ where: { city_id: cityId } });
  if (!city) throw new AppError('Ciudad no encontrada', 404);

  if (description !== undefined) {
    if (description.trim() === '') {
      throw new AppError('El nombre de la ciudad no puede estar vacío', 422);
    }
    const duplicate = await findByName(description, city.city_id);
    if (duplicate) {
      throw new AppError(`La ciudad "${duplicate.description}" ya existe`, 409);
    }
  }

  const oldValues = { description: city.description, active: city.active };

  await city.update({
    description: description !== undefined ? description.trim() : city.description,
    active:      active !== undefined ? active : city.active,
  });

  await logAction({
    tenant_id: null,
    user_id: actorId,
    table_name: 'city',
    record_id: city.city_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: { description: city.description, active: city.active },
    ip_address: ipAddress,
  });

  return city;
};

/**
 * Deshabilitar una ciudad no afecta a las sucursales que ya la tienen: sólo
 * deja de ofrecerse al asignar una nueva. Por eso devolvemos cuántas la usan,
 * para poder advertirlo antes de confirmar.
 */
export const setCityStatus = async (cityId, active, actorId, ipAddress) => {
  const city = await City.findOne({ where: { city_id: cityId } });
  if (!city) throw new AppError('Ciudad no encontrada', 404);

  const oldValue = city.active;
  await city.update({ active });

  await logAction({
    tenant_id: null,
    user_id: actorId,
    table_name: 'city',
    record_id: city.city_id,
    action: 'UPDATE',
    old_values: { active: oldValue },
    new_values: { active },
    ip_address: ipAddress,
  });

  const branchesCount = await Branch.count({ where: { city_id: cityId } });

  return { city_id: city.city_id, active: city.active, branches_count: branchesCount };
};

export default {
  listCities,
  listCitiesWithUsage,
  getCityById,
  createCity,
  updateCity,
  setCityStatus,
};
