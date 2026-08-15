import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { requireActiveService } from '../../middlewares/requireActiveService.js';
import { listUsers, getUser, createUser, updateUser, toggleUserStatus } from '../../controllers/user.controller.js';

const router = Router();

router.use(authenticate, requireActiveService, requireRole('admin'));

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
 *     summary: Listar todos los usuarios del restaurante
 *     description: Obtiene la lista de todos los usuarios del restaurante autenticado con sus roles y estados.
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
 *                       active:
 *                         type: boolean
 *                       role:
 *                         type: object
 *                         properties:
 *                           role_id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Obtener datos de un usuario específico
 *     description: Obtiene los detalles completos de un usuario incluyendo su rol y estado.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos del usuario obtenidos exitosamente
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
 *                     user_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     active:
 *                       type: boolean
 *                     role:
 *                       type: object
 *                       properties:
 *                         role_id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Crear un usuario en el tenant
 *     description: Crea un nuevo usuario en el restaurante del administrador autenticado.
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
 *                 example: "Juan"
 *                 description: Nombre del usuario (requerido)
 *               last_name:
 *                 type: string
 *                 example: "Pérez"
 *                 description: Apellido del usuario (opcional)
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@restaurante.com"
 *                 description: Email del usuario (requerido, único)
 *               phone:
 *                 type: string
 *                 example: "3001234567"
 *                 description: Teléfono del usuario (opcional)
 *               password:
 *                 type: string
 *                 example: "Password123!"
 *                 description: Contraseña del usuario (requerido, mín 8 caracteres)
 *               role_id:
 *                 type: integer
 *                 example: 2
 *                 description: ID del rol del usuario (requerido)
 *               active:
 *                 type: boolean
 *                 example: true
 *                 description: Estado del usuario (opcional, defecto true)
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       409:
 *         description: El email ya está registrado
 *       422:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Actualizar un usuario existente
 *     description: Actualiza la información básica de un usuario existente.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
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
 *                 example: "Juan Actualizado"
 *               last_name:
 *                 type: string
 *                 example: "García"
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Usuario no encontrado
 *       422:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/v1/users/{id}/toggle:
 *   patch:
 *     summary: Activar o desactivar usuario
 *     description: Cambia el estado (activo/inactivo) de un usuario del restaurante.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
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
 *                 description: Nuevo estado del usuario (requerido)
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado exitosamente
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
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     active:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Usuario no encontrado
 *       422:
 *         description: El campo active debe ser boolean
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/toggle', toggleUserStatus);

export default router;
