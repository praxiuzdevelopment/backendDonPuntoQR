import scheduleService from '../services/schedule.service.js';

export const updateSchedules = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { schedules } = req.body; // Array de horarios

    if (!Array.isArray(schedules)) {
      return res.status(422).json({ success: false, message: 'schedules debe ser un arreglo' });
    }

    const result = await scheduleService.updateSchedules(
      req.user.tenant_id,
      branchId,
      schedules,
      req.user.user_id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[schedule.controller] updateSchedules:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { updateSchedules };
