import branchService from '../services/branch.service.js';

export const listBranches = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    if (!tenantId) {
      console.warn('[branch.controller] listBranches: No tenant_id in token for user', req.user.user_id);
      return res.status(400).json({ success: false, message: 'No se pudo identificar el restaurante' });
    }
    const branches = await branchService.listBranches(tenantId);
    return res.status(200).json({ success: true, data: branches });
  } catch (error) {
    console.error('[branch.controller] listBranches Error:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await branchService.getBranchById(req.user.tenant_id, id);
    return res.status(200).json({ success: true, data: branch });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[branch.controller] getBranch:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body; // Se espera validación previa con Joi

    const result = await branchService.updateBranch(
      req.user.tenant_id,
      id,
      data,
      req.user.user_id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[branch.controller] updateBranch:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const assignManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { manager_id } = req.body;

    const result = await branchService.assignManager(
      req.user.tenant_id,
      id,
      manager_id,
      req.user.user_id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[branch.controller] assignManager:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { listBranches, updateBranch, assignManager };
