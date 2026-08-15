import { QRCode, Menu, Tenant, Branch } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import {
  presentMenu,
  menuRenderInclude,
  branchRenderInclude,
} from '../services/menuPresenter.js';

/**
 * Menú público de un código QR.
 *
 * Devuelve el contrato de renderizado (ver menuPresenter): la misma forma que
 * consume la previsualización del panel, para que ambas pinten idéntico.
 */
export const getMenuByQRCode = catchAsync(async (req, res) => {
  const { code } = req.params;

  const qr = await QRCode.findOne({ where: { code, active: true } });
  if (!qr) {
    throw new AppError('El código QR es inválido o está desactivado', 404);
  }

  const tenant = await Tenant.findByPk(qr.tenant_id);
  if (!tenant || !tenant.active) {
    throw new AppError('El restaurante no se encuentra disponible', 404);
  }

  // El QR sabe de qué sede es; si no lo dice, caemos a la sede principal para
  // que los datos de contacto nunca queden vacíos.
  const branch = await Branch.findOne({
    where: qr.branch_id
      ? { branch_id: qr.branch_id }
      : { tenant_id: tenant.tenant_id, active: true },
    include: branchRenderInclude,
    order: [['branch_id', 'ASC']],
  });

  const where = { tenant_id: tenant.tenant_id, active: true };
  if (qr.menu_id) where.menu_id = qr.menu_id;

  const menu = await Menu.findOne({
    where,
    include: menuRenderInclude,
    order: [['created_at', 'DESC']],
  });

  if (!menu) {
    throw new AppError('No hay menús activos disponibles para este código', 404);
  }

  return res.status(200).json({
    success: true,
    data: presentMenu({
      menu,
      tenant,
      branch,
      context: { qr_type: qr.qr_type, table_number: qr.table_number },
    }),
  });
});

export default { getMenuByQRCode };
