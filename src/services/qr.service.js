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

  // Un menú, un código. Se comprueba aquí para dar un mensaje claro en vez de
  // dejar que reviente el índice único de la base de datos.
  let followsActiveMenu = false;
  if (menuId) {
    const existing = await QRCode.findOne({ where: { tenant_id: tenantId, menu_id: menuId } });
    if (existing) {
      throw new AppError('Este menú ya tiene un código QR', 409);
    }

    const menu = await Menu.findOne({ where: { menu_id: menuId, tenant_id: tenantId } });
    if (!menu) throw new AppError('Menú no encontrado', 404);

    // El código del menú principal es el de las mesas: debe seguir la
    // temporada vigente sin que nadie lo reimprima. Los demás nacen fijos,
    // porque si se creó un menú aparte es para que ese código lo muestre.
    followsActiveMenu = menu.is_default === true;
  }

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
    follows_active_menu: followsActiveMenu,
    color,
    active: true,
  });

  const targetUrl = publicUrlFor(code);

  // Fondo blanco y 512px: el QR se descarga para imprimirlo o pegarlo en una
  // mesa, y un PNG transparente se vuelve ilegible sobre fondos oscuros.
  const qrBase64 = await QRCodeLibrary.toDataURL(targetUrl, {
    color: {
      dark: color,
      light: '#ffffffff',
    },
    width: 512,
    margin: 2,
  });

  return {
    qr_code_id: qrRecord.qr_code_id,
    code,
    qr_type: qrRecord.qr_type,
    table_number: qrRecord.table_number,
    follows_active_menu: qrRecord.follows_active_menu,
    active: qrRecord.active,
    target_url: targetUrl,
    image_base64: qrBase64
  };
};

/** URL pública a la que apunta un código. */
const publicUrlFor = (code) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  return `${baseUrl}/public/menus/${code}`;
};

/**
 * Código QR asociado a un menú, si ya existe.
 *
 * La imagen no se guarda en base de datos: se vuelve a dibujar a partir del
 * código, que es lo único que debe ser estable. Así el PNG nunca queda
 * desincronizado y no ocupamos espacio con datos derivables.
 */
export const getMenuQRCode = async (tenantId, menuId) => {
  // Sin filtrar por `active`: si el código está inhabilitado sigue existiendo,
  // y ocultarlo aquí haría que el editor ofreciera generar un segundo QR para
  // el mismo menú.
  const qrRecord = await QRCode.findOne({
    where: { tenant_id: tenantId, menu_id: menuId },
    order: [['created_at', 'ASC']],
  });

  if (!qrRecord) return null;

  const targetUrl = publicUrlFor(qrRecord.code);
  const image = await QRCodeLibrary.toDataURL(targetUrl, {
    color: { dark: qrRecord.color || '#000000', light: '#ffffffff' },
    width: 512,
    margin: 2,
  });

  return {
    qr_code_id:   qrRecord.qr_code_id,
    code:         qrRecord.code,
    qr_type:      qrRecord.qr_type,
    table_number: qrRecord.table_number,
    active:       qrRecord.active,
    follows_active_menu: qrRecord.follows_active_menu,
    target_url:   targetUrl,
    image_base64: image,
  };
};

/**
 * Códigos QR del restaurante para el módulo de gestión.
 *
 * Incluye el menú al que apunta y la URL pública, que es lo que se necesita
 * para decidir si un código sigue siendo útil o hay que darlo de baja.
 */
export const listQRCodes = async (tenantId) => {
  const qrs = await QRCode.findAll({
    where: { tenant_id: tenantId },
    include: [{ model: Menu, as: 'menu', attributes: ['menu_id', 'name', 'active'], required: false }],
    order: [['created_at', 'DESC']],
  });

  return qrs.map((qr) => {
    const plain = qr.toJSON();
    return {
      ...plain,
      target_url: publicUrlFor(plain.code),
      menu: plain.menu ?? null,
    };
  });
};

export const setQRCodeStatus = async (tenantId, qrCodeId, active) => {
  const qr = await QRCode.findOne({ where: { qr_code_id: qrCodeId, tenant_id: tenantId } });
  if (!qr) throw new AppError('Código QR no encontrado', 404);

  await qr.update({ active });
  return { qr_code_id: qr.qr_code_id, code: qr.code, active: qr.active };
};

/**
 * Elimina un código QR.
 *
 * Es destructivo de verdad: el código deja de existir y cualquier QR ya impreso
 * con él queda inservible. Por eso la interfaz lo confirma antes.
 */
export const deleteQRCode = async (tenantId, qrCodeId) => {
  const qr = await QRCode.findOne({ where: { qr_code_id: qrCodeId, tenant_id: tenantId } });
  if (!qr) throw new AppError('Código QR no encontrado', 404);

  const { code } = qr;
  await qr.destroy();
  return { qr_code_id: Number(qrCodeId), code };
};

/**
 * Cambia el modo de resolución de un código.
 *
 * Fijo: sirve siempre su menú. Automático: sirve la temporada vigente y, si no
 * hay, el menú principal de la sede.
 */
export const setQRCodeMode = async (tenantId, qrCodeId, followsActiveMenu) => {
  const qr = await QRCode.findOne({ where: { qr_code_id: qrCodeId, tenant_id: tenantId } });
  if (!qr) throw new AppError('Código QR no encontrado', 404);

  await qr.update({ follows_active_menu: followsActiveMenu });
  return { qr_code_id: qr.qr_code_id, follows_active_menu: qr.follows_active_menu };
};

export default { generateQRCode, listQRCodes, getMenuQRCode, setQRCodeStatus, setQRCodeMode, deleteQRCode };
