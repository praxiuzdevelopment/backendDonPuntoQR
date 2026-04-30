import AppError from '../utils/AppError.js';
import { Schedule, Branch } from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';

export const updateSchedules = async (tenantId, branchId, schedulesArray, actorId, ipAddress) => {
  const branch = await Branch.findOne({ where: { branch_id: branchId, tenant_id: tenantId } });
  if (!branch) throw new AppError('Sucursal no encontrada', 404);

  // Eliminar horarios anteriores para esta sucursal (estrategia transaccional implícita o explícita)
  await Schedule.destroy({ where: { branch_id: branchId } });

  const newSchedules = schedulesArray.map(schedule => ({
    branch_id: branchId,
    dia_semana: schedule.dia_semana,
    open_hour: schedule.open_hour || null,
    close_hour: schedule.close_hour || null,
    closed: schedule.closed !== undefined ? schedule.closed : false,
  }));

  const createdSchedules = await Schedule.bulkCreate(newSchedules);

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'schedule',
    record_id: branch.branch_id,
    action: 'BULK_UPDATE',
    new_values: { schedules: newSchedules },
    ip_address: ipAddress,
  });

  return createdSchedules;
};

export default { updateSchedules };
