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
 *     description: Obtiene la lista completa de todos los restaurantes registrados con su información de licencia y estado.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tenants con su licencia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tenant_id:
 *                         type: integer
 *                       establishment_name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       active:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       license:
 *                         type: object
 *                         properties:
 *                           plan:
 *                             type: string
 *                           days_left:
 *                             type: integer
 *                           end_date:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - se requiere rol super_admin
 *       500:
 *         description: Error interno del servidor
 */
router.get('/tenants', listTenants);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}/status:
 *   patch:
 *     summary: Activar o suspender un restaurante
 *     description: Activa o suspende un restaurante (tenant) en la plataforma. Al suspenderlo, los menús públicos de ese restaurante dejarán de estar accesibles.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tenant (restaurante)
 *         example: 1
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
 *                 description: false para suspender, true para activar
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tenant_id:
 *                       type: integer
 *                       example: 1
 *                     active:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - se requiere rol super_admin
 *       404:
 *         description: Tenant no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/tenants/:id/status', setTenantStatus);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}/license:
 *   post:
 *     summary: Renovar o asignar licencia
 *     description: Renueva la licencia de un restaurante o asigna una nueva. Se acumulan los días si ya tiene una licencia activa.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tenant (restaurante)
 *         example: 1
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
 *                 example: "pro"
 *                 description: Plan de licencia (opcional, defecto basic)
 *               license_days:
 *                 type: integer
 *                 default: 30
 *                 example: 60
 *                 description: Días de licencia (opcional, defecto 30)
 *     responses:
 *       200:
 *         description: Licencia renovada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tenant_id:
 *                       type: integer
 *                       example: 1
 *                     plan:
 *                       type: string
 *                       example: "pro"
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - se requiere rol super_admin
 *       404:
 *         description: Tenant no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/tenants/:id/license', renewLicense);

export default router;
