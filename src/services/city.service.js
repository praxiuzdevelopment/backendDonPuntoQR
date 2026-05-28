import AppError from '../utils/AppError.js';
import { City } from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';

export const listCities = async () => {
  return await City.findAll({
    order: [['description', 'ASC']],
  });
};

export const getCityById = async (cityId) => {
  const city = await City.findOne({ where: { city_id: cityId } });
  if (!city) throw new AppError('Ciudad no encontrada', 404);
  return city;
};

export const createCity = async ({ description }, actorId, ipAddress) => {
  if (!description || description.trim() === '') {
    throw new AppError('La descripción es requerida', 422);
  }

  const city = await City.create({
    description: description.trim(),
  });

  await logAction({
    tenant_id: null,
    user_id: actorId,
    table_name: 'city',
    record_id: city.city_id,
    action: 'INSERT',
    new_values: { description },
    ip_address: ipAddress,
  });

  return city;
};

export const updateCity = async (cityId, { description }, actorId, ipAddress) => {
  const city = await City.findOne({ where: { city_id: cityId } });
  if (!city) throw new AppError('Ciudad no encontrada', 404);

  if (description !== undefined && description.trim() === '') {
    throw new AppError('La descripción no puede estar vacía', 422);
  }

  const oldValues = { description: city.description };

  await city.update({
    description: description !== undefined ? description.trim() : city.description,
  });

  await logAction({
    tenant_id: null,
    user_id: actorId,
    table_name: 'city',
    record_id: city.city_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: { description: city.description },
    ip_address: ipAddress,
  });

  return city;
};

export default { listCities, getCityById, createCity, updateCity };
