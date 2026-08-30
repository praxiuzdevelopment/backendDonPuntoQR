import AppError from './AppError.js';
import { Branch } from '../models/index.js';

/**
 * Comprueba que una sucursal existe y es del restaurante que la está usando.
 *
 * Hace falta en todo sitio donde un `branch_id` llega desde el cliente. Sin esta
 * comprobación, un administrador podía enviar el id de la sede de otro
 * restaurante y quedaba guardado: la carta pública terminaba mostrando la
 * dirección, los teléfonos y los horarios de un tercero.
 *
 * Devuelve 404 y no 403 a propósito: para quien pregunta, una sede que no es
 * suya no debe distinguirse de una que no existe.
 *
 * @param {number} tenantId
 * @param {number|null|undefined} branchId  Nulo significa "todas las sedes" y se acepta.
 * @returns {Promise<Branch|null>}
 */
export const assertBranchInTenant = async (tenantId, branchId) => {
  if (branchId === null || branchId === undefined || branchId === '') return null;

  const id = Number(branchId);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('branch_id inválido', 422);
  }

  const branch = await Branch.findOne({ where: { branch_id: id, tenant_id: tenantId } });
  if (!branch) throw new AppError('Sucursal no encontrada', 404);

  return branch;
};

export default { assertBranchInTenant };
