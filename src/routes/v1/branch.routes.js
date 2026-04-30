import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { listBranches, updateBranch, assignManager } from '../../controllers/branch.controller.js';
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
 *     summary: Listar sucursales del tenant
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sucursales
 */
router.get('/', listBranches);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   put:
 *     summary: Actualizar datos de la sucursal (configuración)
 *     tags: [Branches]
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
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city_id:
 *                 type: integer
 *               phone_1:
 *                 type: string
 *               whatsapp_number:
 *                 type: string
 *               instagram_url:
 *                 type: string
 *               facebook_url:
 *                 type: string
 *               tiktok_url:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Sucursal actualizada
 */
router.put('/:id', updateBranch);

/**
 * @swagger
 * /api/v1/branches/{id}/manager:
 *   patch:
 *     summary: Asignar o remover manager de una sucursal
 *     tags: [Branches]
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
 *               manager_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Manager asignado
 */
router.patch('/:id/manager', assignManager);

/**
 * @swagger
 * /api/v1/branches/{id}/schedules:
 *   put:
 *     summary: Actualizar horarios de una sucursal
 *     tags: [Branches]
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
 *               schedules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dia_semana:
 *                       type: integer
 *                       description: 0=Domingo, 1=Lunes, ...
 *                     open_hour:
 *                       type: string
 *                       format: time
 *                     close_hour:
 *                       type: string
 *                       format: time
 *                     closed:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Horarios actualizados
 */
router.put('/:branchId/schedules', updateSchedules);

export default router;
