import categoryService from '../services/category.service.js';

export const listCategories = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    if (!tenantId) {
      console.warn('[category.controller] listCategories: No tenant_id in token for user', req.user.user_id);
      return res.status(400).json({ success: false, message: 'No se pudo identificar el restaurante' });
    }
    const categories = await categoryService.listCategories(tenantId);
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('[category.controller] listCategories Error:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(req.user.tenant_id, id);
    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[category.controller] getCategory:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, active } = req.body;
    if (!name) {
      return res.status(422).json({ success: false, message: 'El nombre es requerido' });
    }

    const result = await categoryService.createCategory(
      req.user.tenant_id,
      { name, description, active },
      req.user.id,
      req.ip
    );
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('[category.controller] createCategory:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await categoryService.updateCategory(
      req.user.tenant_id,
      id,
      { name, description },
      req.user.id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[category.controller] updateCategory:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(422).json({ success: false, message: 'El campo active debe ser boolean' });
    }

    const result = await categoryService.toggleCategoryStatus(
      req.user.tenant_id,
      id,
      active,
      req.user.id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[category.controller] toggleCategoryStatus:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { listCategories, createCategory, updateCategory, toggleCategoryStatus };
