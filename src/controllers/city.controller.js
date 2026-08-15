import cityService from '../services/city.service.js';

export const listCities = async (req, res) => {
  try {
    // Sólo el staff de DonPunto ve las inactivas; el selector de sucursales no.
    const isSuperAdmin = req.user && !req.user.tenant_id && req.user.role === 'super_admin';
    const cities = isSuperAdmin && req.query.include_inactive === 'true'
      ? await cityService.listCitiesWithUsage()
      : await cityService.listCities();

    return res.status(200).json({ success: true, data: cities });
  } catch (error) {
    console.error('[city.controller] listCities Error:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await cityService.getCityById(id);
    return res.status(200).json({ success: true, data: city });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[city.controller] getCity:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createCity = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(422).json({ success: false, message: 'El nombre de la ciudad es requerido' });
    }

    const result = await cityService.createCity(
      { description },
      req.user.user_id,
      req.ip
    );
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[city.controller] createCity:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, active } = req.body;

    const result = await cityService.updateCity(
      id,
      { description, active },
      req.user.user_id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[city.controller] updateCity:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const toggleCityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(422).json({ success: false, message: 'El campo active debe ser boolean' });
    }

    const result = await cityService.setCityStatus(id, active, req.user.user_id, req.ip);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[city.controller] toggleCityStatus:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { listCities, getCity, createCity, updateCity, toggleCityStatus };
