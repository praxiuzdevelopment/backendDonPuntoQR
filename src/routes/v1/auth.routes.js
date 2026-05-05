import { Router } from 'express';
import { login, register } from '../../controllers/auth.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación de usuarios y registro de nuevos clientes
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: |
 *       Autentica al usuario y retorna un JWT.
 *       El `tenant_id` va embebido en el token — nunca en el body.
 *       El `slug` permite al frontend construir la URL pública del menú.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@restaurante.com
 *               password:
 *                 type: string
 *                 example: "mi_contraseña_segura"
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *                     restaurant_name:
 *                       type: string
 *                       example: "Piqueteadero Don Juan"
 *                     user:
 *                       type: string
 *                       example: "Juan García"
 *                     role:
 *                       type: integer
 *                       example: 2
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiJ9..."
 *                     license_days:
 *                       type: integer
 *                       example: 28
 *                     license_end_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-31T23:59:59.000Z"
 *                     slug:
 *                       type: string
 *                       example: "piqueteaderodonjuan"
 *       401:
 *         description: Credenciales inválidas
 *       422:
 *         description: Campos requeridos faltantes
 */
router.post('/login', login);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registro público de nuevo restaurante
 *     description: |
 *       Crea un nuevo tenant, una sucursal principal, un usuario administrador y una licencia de prueba de 3 días.
 *       El slug se genera automáticamente a partir del `establishment_name` (solo letras y números).
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [establishment_name, admin_name, email, password]
 *             properties:
 *               establishment_name:
 *                 type: string
 *                 example: "Don Punto!"
 *               admin_name:
 *                 type: string
 *                 example: "Admin"
 *               last_name:
 *                 type: string
 *                 example: "Punto"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contacto@donpunto.com"
 *               phone:
 *                 type: string
 *                 example: "3001234567"
 *               password:
 *                 type: string
 *                 example: "Password123!"
 *     responses:
 *       201:
 *         description: Restaurante registrado exitosamente
 *       409:
 *         description: El email ya está registrado
 *       422:
 *         description: Campos requeridos faltantes
 */
router.post('/register', register);

export default router;
