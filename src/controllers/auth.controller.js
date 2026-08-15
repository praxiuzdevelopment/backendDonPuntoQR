import authService from '../services/auth.service.js';
import adminService from '../services/admin.service.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
    }

    const result = await authService.login({ email, password });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        // El cliente decide qué mostrar según el código, no según el texto.
        ...(error.code && { code: error.code }),
        ...(error.details && { details: error.details }),
      });
    }
    console.error('[auth.controller] login error:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const register = async (req, res) => {
  try {
    const { establishment_name, admin_name, last_name, email, phone, password } = req.body;

    if (!establishment_name || !admin_name || !email || !password) {
      return res.status(422).json({
        success: false,
        message: 'establishment_name, admin_name, email y password son requeridos',
      });
    }

    // Registro público: siempre plan basic y 3 días de trial
    const result = await adminService.createTenant({
      establishment_name,
      admin_name,
      last_name,
      email,
      phone,
      password,
      plan: 'basic',
      license_days: 3,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('[auth.controller] register error:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { login, register };
