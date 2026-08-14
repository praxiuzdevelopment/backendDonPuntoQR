import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireSuperAdmin } from '../../middlewares/requireSuperAdmin.js';
import {
  createTenant,
  listTenants,
  getTenantDetail,
  updateTenant,
  setTenantStatus,
  renewLicense,
} from '../../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, requireSuperAdmin);

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
 * /api/v1/admin/tenants/{id}:
 *   get:
 *     summary: Ficha completa de un restaurante
 *     description: |
 *       Devuelve el detalle de un restaurante: licencia vigente con días restantes,
 *       sucursales con su ciudad, usuarios con su rol y conteos de catálogo.
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
 *     responses:
 *       200:
 *         description: Detalle del restaurante
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
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     logo_url:
 *                       type: string
 *                       nullable: true
 *                     active:
 *                       type: boolean
 *                     license:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         plan:
 *                           type: string
 *                         status:
 *                           type: string
 *                         start_date:
 *                           type: string
 *                           format: date-time
 *                         end_date:
 *                           type: string
 *                           format: date-time
 *                         days_left:
 *                           type: integer
 *                     branches:
 *                       type: array
 *                       items:
 *                         type: object
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                     stats:
 *                       type: object
 *                       properties:
 *                         categories:
 *                           type: integer
 *                         products:
 *                           type: integer
 *                         menus:
 *                           type: integer
 *                         branches:
 *                           type: integer
 *                         users:
 *                           type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - ruta exclusiva del equipo DonPunto
 *       404:
 *         description: Tenant no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/tenants/:id', getTenantDetail);

/**
 * @swagger
 * /api/v1/admin/tenants/{id}:
 *   put:
 *     summary: Actualizar datos del restaurante
 *     description: |
 *       Actualiza el nombre y/o logo del restaurante.
 *       El `slug` no es modificable: ya está impreso en los códigos QR distribuidos.
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Piqueteadero Don Juan"
 *               logo_url:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Restaurante actualizado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Tenant no encontrado
 *       422:
 *         description: No se enviaron campos válidos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/tenants/:id', updateTenant);

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
 *     description: |
 *       Renueva la licencia de un restaurante o le asigna una nueva.
 *
 *       Los días **se acumulan**: si la licencia sigue vigente, los días nuevos
 *       se suman al vencimiento actual, de modo que renovar por anticipado nunca
 *       recorta tiempo de uso. Si ya venció, el conteo arranca en la fecha actual.
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
 *                     license_end_date:
 *                       type: string
 *                       format: date-time
 *                       description: Nuevo vencimiento tras acumular los días
 *                     days_left:
 *                       type: integer
 *                       example: 40
 *                     days_added:
 *                       type: integer
 *                       example: 30
 *                     accumulated:
 *                       type: boolean
 *                       description: true si se sumó sobre una licencia vigente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - ruta exclusiva del equipo DonPunto
 *       404:
 *         description: Tenant no encontrado
 *       422:
 *         description: license_days inválido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/tenants/:id/license', renewLicense);

export default router;
