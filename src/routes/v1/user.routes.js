import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { listUsers, getUser, createUser, updateUser, toggleUserStatus } from '../../controllers/user.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios dentro del tenant
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Listar usuarios del tenant
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
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
 *                       user_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       role:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 */
router.get('/', listUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Obtener datos de un usuario específico
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', getUser);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Crear un usuario en el tenant
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role_id]
 *             properties:
 *               name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post('/', createUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Actualizar datos básicos de usuario
 *     tags: [Users]
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
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/:id', updateUser);

/**
 * @swagger
 * /api/v1/users/{id}/toggle:
 *   patch:
 *     summary: Activar o desactivar usuario
 *     tags: [Users]
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
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado
 */
router.patch('/:id/toggle', toggleUserStatus);

export default router;
