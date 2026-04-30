import menuService from '../services/menu.service.js';

export const listMenus = async (req, res) => {
  try {
    const menus = await menuService.listMenus(req.user.tenant_id);
    return res.status(200).json({ success: true, data: menus });
  } catch (error) {
    console.error('[menu.controller] listMenus:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getMenuDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await menuService.getMenuDetail(req.user.tenant_id, id);
    return res.status(200).json({ success: true, data: menu });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[menu.controller] getMenuDetail:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createMenu = async (req, res) => {
  try {
    const { name, template_id } = req.body;
    if (!name || !template_id) {
      return res.status(422).json({ success: false, message: 'name y template_id son requeridos' });
    }

    const result = await menuService.createMenu(
      req.user.tenant_id,
      req.body,
      req.user.id,
      req.ip
    );
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('[menu.controller] createMenu:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const updateMenuStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { sections } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(422).json({ success: false, message: 'sections debe ser un arreglo de categorías' });
    }

    const result = await menuService.updateMenuStructure(
      req.user.tenant_id,
      id,
      sections,
      req.user.id,
      req.ip
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[menu.controller] updateMenuStructure:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { listMenus, getMenuDetail, createMenu, updateMenuStructure };
