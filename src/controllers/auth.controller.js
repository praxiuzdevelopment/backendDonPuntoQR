import authService from '../services/auth.service.js';

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
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('[auth.controller] login error:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { login };
