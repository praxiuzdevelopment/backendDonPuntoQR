import cityService from '../services/city.service.js';

export const listCities = async (req, res) => {
  try {
    const cities = await cityService.listCities();
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
      return res.status(422).json({ success: false, message: 'La descripción es requerida' });
    }

    const result = await cityService.createCity(
      { description },
      req.user.id,
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
    const { description } = req.body;

    const result = await cityService.updateCity(
      id,
      { description },
      req.user.id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[city.controller] updateCity:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { listCities, getCity, createCity, updateCity };
