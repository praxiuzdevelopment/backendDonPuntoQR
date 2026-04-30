import templateService from '../services/template.service.js';

export const listTemplates = async (req, res) => {
  try {
    const templates = await templateService.listTemplates();
    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error('[template.controller] listTemplates:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { listTemplates };
