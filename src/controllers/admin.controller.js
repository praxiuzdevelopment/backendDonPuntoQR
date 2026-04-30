import adminService from '../services/admin.service.js';

export const createTenant = async (req, res) => {
  try {
    const { name, email, password, plan, license_days, city_id } = req.body;

    if (!name || !email || !password) {
      return res.status(422).json({
        success: false,
        message: 'name, email y password son requeridos',
      });
    }

    const result = await adminService.createTenant({ name, email, password, plan, license_days, city_id });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[admin.controller] createTenant:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const listTenants = async (req, res) => {
  try {
    const tenants = await adminService.listTenants();
    return res.status(200).json({ success: true, data: tenants });
  } catch (error) {
    console.error('[admin.controller] listTenants:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const setTenantStatus = async (req, res) => {
  try {
    const { id }    = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(422).json({ success: false, message: 'El campo active debe ser boolean' });
    }

    const result = await adminService.setTenantStatus(id, active);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[admin.controller] setTenantStatus:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const renewLicense = async (req, res) => {
  try {
    const { id }                      = req.params;
    const { plan = 'basic', license_days = 30 } = req.body;

    const result = await adminService.renewLicense(id, { plan, license_days });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[admin.controller] renewLicense:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { createTenant, listTenants, setTenantStatus, renewLicense };
