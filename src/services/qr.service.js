import QRCodeLibrary from 'qrcode';
import crypto from 'crypto';
import AppError from '../utils/AppError.js';
import { QRCode, Menu, Tenant } from '../models/index.js';

/**
 * Genera un string único para el QR
 */
const generateUniqueCode = () => {
  return crypto.randomBytes(4).toString('hex'); // Ej: 8a9b2c3d
};

export const generateQRCode = async ({ tenantId, menuId, branchId = null, tableNumber = null, color = '#000000' }) => {
  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant) throw new AppError('Tenant no encontrado', 404);

  // Generar código único para la URL
  let code;
  let isUnique = false;
  while (!isUnique) {
    code = `${tenant.slug}-${generateUniqueCode()}`;
    const exists = await QRCode.findOne({ where: { code } });
    if (!exists) isUnique = true;
  }

  // Determinar tipo
  const qrType = tableNumber ? 'table' : 'general';

  // Guardar en Base de Datos
  const qrRecord = await QRCode.create({
    tenant_id: tenantId,
    menu_id: menuId || null,
    branch_id: branchId || null,
    code,
    qr_type: qrType,
    table_number: tableNumber,
    color,
    active: true,
  });

  // URL Pública a la que apuntará el QR
  // Si tienes un dominio frontend, se configuraría en las variables de entorno
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const targetUrl = `${baseUrl}/public/menus/${code}`;

  // Generar imagen Base64
  const qrBase64 = await QRCodeLibrary.toDataURL(targetUrl, {
    color: {
      dark: color,       // Color de los cuadritos
      light: '#ffffff00' // Fondo transparente
    },
    width: 300,
    margin: 2
  });

  return {
    qr_code_id: qrRecord.qr_code_id,
    code,
    qr_type: qrRecord.qr_type,
    table_number: qrRecord.table_number,
    target_url: targetUrl,
    image_base64: qrBase64
  };
};

export const listQRCodes = async (tenantId) => {
  return await QRCode.findAll({
    where: { tenant_id: tenantId },
    order: [['created_at', 'DESC']]
  });
};

export default { generateQRCode, listQRCodes };
