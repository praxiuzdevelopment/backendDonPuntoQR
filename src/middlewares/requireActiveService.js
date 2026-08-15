import { Tenant, License } from '../models/index.js';
import { evaluateService } from '../utils/license.js';

/**
 * Corta el servicio de un restaurante con la licencia vencida (pasado el
 * periodo de gracia) o suspendido.
 *
 * Hace falta además del bloqueo en el login porque los tokens ya emitidos
 * siguen siendo válidos durante horas: sin esto, el corte no sería real hasta
 * que expirara el JWT.
 */
export const requireActiveService = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }

  // El staff de DonPunto no pertenece a ningún restaurante.
  if (!req.user.tenant_id) return next();

  try {
    const [tenant, license] = await Promise.all([
      Tenant.findByPk(req.user.tenant_id, { attributes: ['tenant_id', 'name', 'active'] }),
      License.findOne({ where: { tenant_id: req.user.tenant_id } }),
    ]);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }

    const service = evaluateService(tenant, license);
    if (service.blocked) {
      return res.status(403).json({
        success: false,
        code:    service.code,
        message: 'El servicio está inactivo. Comunícate con DonPunto para reactivarlo.',
        details: {
          restaurant_name: tenant.name,
          end_date:        service.end_date,
          days_overdue:    service.days_overdue,
        },
      });
    }

    return next();
  } catch (error) {
    console.error('[requireActiveService]', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default requireActiveService;
