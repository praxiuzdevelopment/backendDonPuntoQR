import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import {
  createTenant,
  listTenants,
  setTenantStatus,
  renewLicense,
} from '../../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, requireRole('super_admin'));

/**
 * @swagger
 * tags:
 *   name: Super Admin
 *   description: Gestión global de clientes (solo equipo DonPunto)
 */

/**
 * @swagger
 * /api/v1/admin/tenants:
 *   post:
 *     summary: Crear nuevo cliente (restaurante)
 *     description: |
 *       Crea en una **transacción atómica**: tenant + usuario admin + licencia.
 *       Solo accesible por `super_admin`.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               establishment_name:
 *                 type: string
 *                 example: "Piqueteadero Don Juan"
 *               admin_name:
 *                 type: string
 *                 example: "Juan"
 *               last_name:
 *                 type: string
 *                 example: "García"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@donjuan.com"
 *               phone:
 *                 type: string
 *                 example: "3001234567"
 *               password:
 *                 type: string
 *                 example: "Temporal123!"
 *               plan:
 *                 type: string
 *                 enum: [free, basic, pro]
 *                 default: basic
 *               license_days:
 *                 type: integer
 *                 default: 30
 *                 example: 30
 *               city_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *       409:
 *         description: Email ya registrado
 *       422:
 *         description: Campos requeridos faltantes
 */
router.post('/tenants', createTenant);

/**
 * @swagger
 * /api/v1/admin/tenants:
 *   get:
 *     summary: Listar todos los restaurantes
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tenants con su licencia
 */
router.get('/tenants', listTenants);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}/status:
 *   patch:
 *     summary: Activar o suspender un restaurante
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [active]
 *             properties:
 *               active:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Tenant no encontrado
 */
router.patch('/tenants/:id/status', setTenantStatus);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}/license:
 *   post:
 *     summary: Renovar o asignar licencia
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [free, basic, pro]
 *                 default: basic
 *               license_days:
 *                 type: integer
 *                 default: 30
 *     responses:
 *       200:
 *         description: Licencia renovada
 *       404:
 *         description: Tenant no encontrado
 */
router.post('/tenants/:id/license', renewLicense);

export default router;
