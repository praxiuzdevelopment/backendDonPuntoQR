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

export default { generateQRCode, listQRCodes };
