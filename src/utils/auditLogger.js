import { AuditLog } from '../models/index.js';

/**
 * Registra una acción en la pista de auditoría.
 *
 * @param {Object} params
 * @param {number} [params.tenant_id] - ID del tenant (puede ser null para super_admin)
 * @param {number} params.user_id - ID del usuario que realizó la acción
 * @param {string} params.table_name - Nombre de la tabla afectada
 * @param {number} [params.record_id] - ID del registro afectado
 * @param {string} params.action - INSERT, UPDATE, DELETE
 * @param {Object} [params.old_values] - Valores anteriores (solo para UPDATE/DELETE)
 * @param {Object} [params.new_values] - Nuevos valores (solo para INSERT/UPDATE)
 * @param {string} [params.ip_address] - Dirección IP de la solicitud
 */
export const logAction = async ({
  tenant_id,
  user_id,
  table_name,
  record_id,
  action,
  old_values = null,
  new_values = null,
  ip_address = null,
}) => {
  try {
    await AuditLog.create({
      tenant_id,
      user_id,
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      ip_address,
    });
  } catch (error) {
    // Si falla el log de auditoría, lo reportamos pero no queremos bloquear la petición principal
    console.error(`[AuditLogger] Error registrando acción ${action} en ${table_name}:`, error);
  }
};
