import { Op } from 'sequelize';
import { Menu, Branch } from '../models/index.js';

/**
 * Qué menú sirve un código QR en este momento.
 *
 * Es la única autoridad sobre esa pregunta. La escalera es deliberadamente
 * explícita y su último peldaño es "nada": antes, al no encontrar menú, se
 * servía el más reciente del restaurante, así que un QR impreso podía empezar a
 * mostrar otra carta sin que nadie lo tocara.
 *
 *   1. El QR está en modo fijo         → su menú
 *   2. Hay temporada vigente en la sede → esa
 *   3. Menú principal de la sede         → el de la sede, o el del restaurante
 *   4. Nada
 */

/** Menús de temporada vigentes ahora mismo, del más recientemente iniciado. */
export const findActiveSeasonalMenus = async (tenantId, now = new Date()) => {
  return Menu.findAll({
    where: {
      tenant_id: tenantId,
      active: true,
      temporal: true,
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now },
    },
    order: [['start_date', 'DESC'], ['menu_id', 'DESC']],
  });
};

/** Menú principal: el de la sede si lo tiene, si no el del restaurante. */
export const findMainMenu = async (tenantId, branch = null) => {
  if (branch?.main_menu_id) {
    const branchMenu = await Menu.findOne({
      where: { menu_id: branch.main_menu_id, tenant_id: tenantId, active: true },
    });
    if (branchMenu) return branchMenu;
  }

  return Menu.findOne({
    where: { tenant_id: tenantId, active: true, is_default: true },
  });
};

/**
 * @param {object} qr      Registro del código QR
 * @param {number} tenantId
 * @param {object} [branch] Sede del QR, ya cargada si se conoce
 * @returns {{ menu: Menu|null, reason: string }}
 */
export const resolveMenuForQR = async (qr, tenantId, branch = null) => {
  // 1. Modo fijo: sirve su menú y no le afecta ninguna temporada.
  if (!qr.follows_active_menu && qr.menu_id) {
    const pinned = await Menu.findOne({
      where: { menu_id: qr.menu_id, tenant_id: tenantId, active: true },
    });
    return { menu: pinned, reason: pinned ? 'pinned' : 'pinned_unavailable' };
  }

  const branchRecord =
    branch ?? (qr.branch_id ? await Branch.findByPk(qr.branch_id) : null);

  // 2. Temporada vigente. Si hay varias solapadas gana la que empezó después,
  //    que es la decisión más reciente del restaurante.
  const seasonal = await findActiveSeasonalMenus(tenantId);
  if (seasonal.length > 0) {
    return { menu: seasonal[0], reason: 'seasonal' };
  }

  // 3. Menú principal.
  const main = await findMainMenu(tenantId, branchRecord);
  if (main) return { menu: main, reason: 'main' };

  // 4. Nada. Nunca "el más reciente".
  return { menu: null, reason: 'none' };
};

/**
 * Menús de temporada cuyo rango de fechas se cruza con el indicado.
 *
 * No bloquea nada: sirve para avisar al restaurante de que dos temporadas se
 * pisan y que, por tanto, la segunda necesitará su propio código QR.
 */
export const findOverlappingMenus = async (tenantId, { start_date, end_date, excludeMenuId = null }) => {
  if (!start_date || !end_date) return [];

  const where = {
    tenant_id: tenantId,
    active: true,
    temporal: true,
    start_date: { [Op.lte]: end_date },
    end_date: { [Op.gte]: start_date },
  };
  if (excludeMenuId) where.menu_id = { [Op.ne]: excludeMenuId };

  return Menu.findAll({ where, attributes: ['menu_id', 'name', 'start_date', 'end_date'] });
};

export default {
  resolveMenuForQR,
  findActiveSeasonalMenus,
  findMainMenu,
  findOverlappingMenus,
};
