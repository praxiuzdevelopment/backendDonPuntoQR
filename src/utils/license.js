/**
 * Estado de servicio de un restaurante.
 *
 * El corte no ocurre el día del vencimiento sino al terminar el periodo de
 * gracia (`license.grace_days`), tal como describe el propio modelo: "Días de
 * gracia tras expiración antes del corte de servicio". Entre el vencimiento y
 * el fin de la gracia el restaurante sigue operando, pero ya ve el aviso.
 */

export const SERVICE_BLOCK_CODES = {
  LICENSE_EXPIRED: 'LICENSE_EXPIRED',
  TENANT_SUSPENDED: 'TENANT_SUSPENDED',
  NO_LICENSE: 'NO_LICENSE',
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const daysBetween = (from, to) => Math.ceil((to.getTime() - from.getTime()) / MS_PER_DAY);

/**
 * @returns {{
 *   blocked: boolean,
 *   code: string|null,
 *   days_left: number,
 *   days_overdue: number,
 *   end_date: Date|null,
 *   grace_ends_at: Date|null
 * }}
 */
export const evaluateService = (tenant, license, now = new Date()) => {
  if (tenant && tenant.active === false) {
    return {
      blocked: true,
      code: SERVICE_BLOCK_CODES.TENANT_SUSPENDED,
      days_left: 0,
      days_overdue: 0,
      end_date: license ? new Date(license.end_date) : null,
      grace_ends_at: null,
    };
  }

  if (!license) {
    // Sin licencia no hay servicio contratado. Falla cerrado a propósito:
    // el equipo DonPunto puede asignar una desde la consola en cualquier momento.
    return {
      blocked: true,
      code: SERVICE_BLOCK_CODES.NO_LICENSE,
      days_left: 0,
      days_overdue: 0,
      end_date: null,
      grace_ends_at: null,
    };
  }

  const endDate = new Date(license.end_date);
  const graceDays = Number.isInteger(license.grace_days) ? license.grace_days : 0;
  const graceEndsAt = new Date(endDate.getTime() + graceDays * MS_PER_DAY);

  const daysLeft = Math.max(daysBetween(now, endDate), 0);
  const daysOverdue = now > endDate ? Math.max(daysBetween(endDate, now), 0) : 0;

  return {
    blocked: now > graceEndsAt,
    code: now > graceEndsAt ? SERVICE_BLOCK_CODES.LICENSE_EXPIRED : null,
    days_left: daysLeft,
    days_overdue: daysOverdue,
    end_date: endDate,
    grace_ends_at: graceEndsAt,
  };
};

export default { evaluateService, SERVICE_BLOCK_CODES };
