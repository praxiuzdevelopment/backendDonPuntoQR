import qrService from '../services/qr.service.js';
import catchAsync from '../utils/catchAsync.js';

export const generateQRCode = catchAsync(async (req, res) => {
  const { menu_id, branch_id, table_number, color } = req.body;
  const tenantId = req.user.tenant_id;

  const result = await qrService.generateQRCode({
    tenantId,
    menuId: menu_id,
    branchId: branch_id,
    tableNumber: table_number,
    color
  });

  res.status(201).json({
    success: true,
    message: 'Código QR generado exitosamente',
    data: result
  });
});

export const listQRCodes = catchAsync(async (req, res) => {
  const tenantId = req.user.tenant_id;
  const qrs = await qrService.listQRCodes(tenantId);
  
  res.status(200).json({
    success: true,
    data: qrs
  });
});


export const getMenuQRCode = catchAsync(async (req, res) => {
  const qr = await qrService.getMenuQRCode(req.user.tenant_id, req.params.menuId);

  if (!qr) {
    return res.status(404).json({ success: false, message: 'Este menú todavía no tiene código QR' });
  }

  return res.status(200).json({ success: true, data: qr });
});


export const toggleQRCodeStatus = catchAsync(async (req, res) => {
  const { active } = req.body;
  if (typeof active !== 'boolean') {
    return res.status(422).json({ success: false, message: 'El campo active debe ser boolean' });
  }

  const data = await qrService.setQRCodeStatus(req.user.tenant_id, req.params.id, active);
  return res.status(200).json({ success: true, data });
});

export const deleteQRCode = catchAsync(async (req, res) => {
  const data = await qrService.deleteQRCode(req.user.tenant_id, req.params.id);
  return res.status(200).json({ success: true, data });
});

export const setQRCodeMode = catchAsync(async (req, res) => {
  const { follows_active_menu } = req.body;
  if (typeof follows_active_menu !== 'boolean') {
    return res.status(422).json({ success: false, message: 'follows_active_menu debe ser boolean' });
  }

  const data = await qrService.setQRCodeMode(req.user.tenant_id, req.params.id, follows_active_menu);
  return res.status(200).json({ success: true, data });
});

export default { generateQRCode, listQRCodes, getMenuQRCode, toggleQRCodeStatus, setQRCodeMode, deleteQRCode };
