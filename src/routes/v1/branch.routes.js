import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { listBranches, getBranch, updateBranch, assignManager } from '../../controllers/branch.controller.js';
import { updateSchedules } from '../../controllers/schedule.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Gestión de sucursales del restaurante
 */

/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     summary: Listar todas las sucursales del restaurante
 *     description: Obtiene la lista de todas las sucursales del restaurante autenticado con sus horarios, ciudad y gerente.
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sucursales obtenida exitosamente
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
 *                       branch_id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Don Punto Centro"
 *                       address:
 *                         type: string
 *                         example: "Carrera 5 No. 10-20"
 *                       phone_1:
 *                         type: string
 *                         example: "+57 1 1234567"
 *                       phone_2:
 *                         type: string
 *                       email:
 *                         type: string
 *                       whatsapp_number:
 *                         type: string
 *                       instagram_url:
 *                         type: string
 *                       facebook_url:
 *                         type: string
 *                       tiktok_url:
 *                         type: string
 *                       active:
 *                         type: boolean
 *                         example: true
 *                       city:
 *                         type: object
 *                         properties:
 *                           description:
 *                             type: string
 *                       manager:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       schedules:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             dia_semana:
 *                               type: integer
 *                             open_hour:
 *                               type: string
 *                             close_hour:
 *                               type: string
 *                             closed:
 *                               type: boolean
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', listBranches);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   get:
 *     summary: Obtener datos de una sucursal específica
 *     description: Obtiene los detalles completos de una sucursal incluyendo horarios, gerente asignado e información de contacto.
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos de la sucursal obtenidos exitosamente
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
 *                     branch_id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Don Punto Centro"
 *                     address:
 *                       type: string
 *                       example: "Carrera 5 No. 10-20"
 *                     phone_1:
 *                       type: string
 *                       example: "+57 1 1234567"
 *                     phone_2:
 *                       type: string
 *                     email:
 *                       type: string
 *                     whatsapp_number:
 *                       type: string
 *                     instagram_url:
 *                       type: string
 *                     facebook_url:
 *                       type: string
 *                     tiktok_url:
 *                       type: string
 *                     active:
 *                       type: boolean
 *                       example: true
 *                     city:
 *                       type: object
 *                       properties:
 *                         description:
 *                           type: string
 *                     manager:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     schedules:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           dia_semana:
 *                             type: integer
 *                           open_hour:
 *                             type: string
 *                           close_hour:
 *                             type: string
 *                           closed:
 *                             type: boolean
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getBranch);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   put:
 *     summary: Actualizar una sucursal existente
 *     description: Actualiza la configuración general de una sucursal incluyendo nombre, dirección, datos de contacto y URLs de redes sociales.
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
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
 *                 example: "Don Punto Centro Actualizado"
 *                 description: Nombre de la sucursal
 *               address:
 *                 type: string
 *                 example: "Carrera 5 No. 20-30"
 *                 description: Dirección de la sucursal
 *               city_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID de la ciudad
 *               phone_1:
 *                 type: string
 *                 example: "+57 1 1234567"
 *                 description: Teléfono principal
 *               phone_2:
 *                 type: string
 *                 description: Teléfono secundario (opcional)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de contacto (opcional)
 *               whatsapp_number:
 *                 type: string
 *                 description: Número de WhatsApp (opcional)
 *               instagram_url:
 *                 type: string
 *                 description: URL de Instagram (opcional)
 *               facebook_url:
 *                 type: string
 *                 description: URL de Facebook (opcional)
 *               tiktok_url:
 *                 type: string
 *                 description: URL de TikTok (opcional)
 *               active:
 *                 type: boolean
 *                 description: Estado de la sucursal (opcional)
 *     responses:
 *       200:
 *         description: Sucursal actualizada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Sucursal no encontrada
 *       422:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', updateBranch);

/**
 * @swagger
 * /api/v1/branches/{id}/manager:
 *   patch:
 *     summary: Asignar o remover gerente de una sucursal
 *     description: Asigna un usuario como gerente de una sucursal, o remueve el gerente actual pasando `manager_id` como `null`.
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [manager_id]
 *             properties:
 *               manager_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 5
 *                 description: ID del usuario a asignar como gerente, o null para remover
 *     responses:
 *       200:
 *         description: Gerente asignado/removido exitosamente
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
 *                     branch_id:
 *                       type: integer
 *                     manager_id:
 *                       type: integer
 *                       nullable: true
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/manager', assignManager);

/**
 * @swagger
 * /api/v1/branches/{branchId}/schedules:
 *   put:
 *     summary: Actualizar horarios de atención de una sucursal
 *     description: Actualiza los horarios de atención de la sucursal para cada día de la semana. Permite configurar días cerrados.
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [schedules]
 *             properties:
 *               schedules:
 *                 type: array
 *                 minItems: 7
 *                 maxItems: 7
 *                 description: Array con horarios para los 7 días de la semana (0=Domingo, 6=Sábado)
 *                 items:
 *                   type: object
 *                   required: [dia_semana]
 *                   properties:
 *                     dia_semana:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       example: 0
 *                       description: "Día de la semana (0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado)"
 *                     open_hour:
 *                       type: string
 *                       format: time
 *                       example: "08:00"
 *                       description: "Hora de apertura en formato HH:mm (requerido si closed=false)"
 *                     close_hour:
 *                       type: string
 *                       format: time
 *                       example: "20:00"
 *                       description: "Hora de cierre en formato HH:mm (requerido si closed=false)"
 *                     closed:
 *                       type: boolean
 *                       example: false
 *                       description: "Indica si la sucursal está cerrada ese día"
 *     responses:
 *       200:
 *         description: Horarios actualizados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Horarios actualizados correctamente"
 *       400:
 *         description: Formato de horarios inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Sucursal no encontrada
 *       422:
 *         description: Datos inválidos - debe incluir los 7 días de la semana
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:branchId/schedules', updateSchedules);

export default router;
