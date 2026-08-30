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
 *
 * Todo el que consulta temporadas debe decir para qué sede pregunta. Sin ese
 * dato la consulta devolvía las de todo el restaurante, así que una promoción
 * creada para una sucursal salía en todas y además tapaba el `main_menu_id` que
 * las demás tuvieran configurado, porque la temporada gana al menú principal.
 */

/** Un menú con `branch_id` nulo vale para todo el restaurante. */
const scopeToBranch = (branchId) =>
  branchId ? { [Op.or]: [{ branch_id: null }, { branch_id: branchId }] } : { branch_id: null };

/**
 * Entre dos temporadas vigentes, la de la sede manda sobre la del restaurante:
 * es la decisión más específica que alguien tomó para esta sucursal.
 *
 * Es una partición estable, así que dentro de cada grupo se respeta el orden
 * por fecha que ya trae la consulta.
 */
const branchFirst = (menus) => [
  ...menus.filter((m) => m.branch_id !== null),
  ...menus.filter((m) => m.branch_id === null),
];

/**
 * Menús de temporada vigentes ahora mismo, del más recientemente iniciado.
 *
 * @param {number} tenantId
 * @param {object} [options]
 * @param {number|null} [options.branchId] Sede que pregunta. Sin ella sólo se
 *        devuelven las temporadas de todo el restaurante.
 * @param {boolean} [options.anyBranch] Ignora el alcance y devuelve las de
 *        cualquier sede. Para las vistas de gestión, que resumen el restaurante
 *        entero y no una carta concreta.
 * @param {Date} [options.now]
 */
export const findActiveSeasonalMenus = async (
  tenantId,
  { branchId = null, anyBranch = false, now = new Date() } = {}
) => {
  const menus = await Menu.findAll({
    where: {
      tenant_id: tenantId,
      active: true,
      temporal: true,
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now },
      ...(anyBranch ? {} : scopeToBranch(branchId)),
    },
    order: [['start_date', 'DESC'], ['menu_id', 'DESC']],
  });

  return branchFirst(menus);
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
    branch ?? (qr.branch_id ? await Branch.findOne({ where: { branch_id: qr.branch_id, tenant_id: tenantId } }) : null);

  // 2. Temporada vigente en esta sede. Si hay varias solapadas gana la de la
  //    sede sobre la del restaurante y, a igual alcance, la que empezó después.
  const seasonal = await findActiveSeasonalMenus(tenantId, {
    branchId: branchRecord?.branch_id ?? null,
  });
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
 *
 * Sólo se comparan menús que puedan coincidir en la misma carta: dos temporadas
 * de sedes distintas nunca compiten entre sí, así que avisar de ellas sería
 * ruido.
 */
export const findOverlappingMenus = async (
  tenantId,
  { start_date, end_date, branch_id = null, excludeMenuId = null }
) => {
  if (!start_date || !end_date) return [];

  const where = {
    tenant_id: tenantId,
    active: true,
    temporal: true,
    start_date: { [Op.lte]: end_date },
    end_date: { [Op.gte]: start_date },
    // Un menú de sede compite con los suyos y con los de todo el restaurante;
    // uno del restaurante compite con todos, porque se muestra en todas partes.
    ...(branch_id ? scopeToBranch(branch_id) : {}),
  };
  if (excludeMenuId) where.menu_id = { [Op.ne]: excludeMenuId };

  return Menu.findAll({
    where,
    attributes: ['menu_id', 'name', 'branch_id', 'start_date', 'end_date'],
  });
};

export default {
  resolveMenuForQR,
  findActiveSeasonalMenus,
  findMainMenu,
  findOverlappingMenus,
};
