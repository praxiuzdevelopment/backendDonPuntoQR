import userService from '../services/user.service.js';

export const listUsers = async (req, res) => {
  try {
    const users = await userService.listUsers(req.user.tenant_id);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('[user.controller] listUsers:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(req.user.tenant_id, id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[user.controller] getUser:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, last_name, email, phone, password, role_id, active } = req.body;
    if (!name || !email || !password || !role_id) {
      return res.status(422).json({ success: false, message: 'Campos requeridos faltantes' });
    }

    const result = await userService.createUser(
      req.user.tenant_id,
      { name, last_name, email, phone, password, role_id, active },
      req.user.id,
      req.ip
    );
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[user.controller] createUser:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, last_name, email, phone, role_id, active } = req.body;

    const result = await userService.updateUser(
      req.user.tenant_id,
      id,
      { name, last_name, email, phone, role_id, active },
      req.user.id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[user.controller] updateUser:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(422).json({ success: false, message: 'El campo active debe ser boolean' });
    }

    const result = await userService.toggleUserStatus(
      req.user.tenant_id,
      id,
      active,
      req.user.id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[user.controller] toggleUserStatus:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { listUsers, createUser, updateUser, toggleUserStatus };
