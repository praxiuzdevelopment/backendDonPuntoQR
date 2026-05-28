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
 *     summary: Iniciar sesión en la plataforma
 *     description: |
 *       Autentica al usuario y retorna un JWT válido.
 *       El JWT contiene el `tenant_id`, `user_id`, `role_id` y otros datos necesarios.
 *       El `tenant_id` siempre va embebido en el token — nunca en el body.
 *       El `slug` permite construir la URL pública del menú QR.
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
 *                 description: Email registrado del usuario
 *               password:
 *                 type: string
 *                 example: "mi_contraseña_segura"
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Login exitoso, JWT retornado en el response
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
 *                       description: Nombre del restaurante
 *                     user:
 *                       type: string
 *                       example: "Juan García"
 *                       description: Nombre completo del usuario
 *                     role:
 *                       type: integer
 *                       example: 2
 *                       description: ID del rol del usuario
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiJ9..."
 *                       description: JWT para autenticación en futuros requests
 *                     license_days:
 *                       type: integer
 *                       example: 28
 *                       description: Días restantes de licencia
 *                     license_end_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-31T23:59:59.000Z"
 *                       description: Fecha de expiración de la licencia
 *                     slug:
 *                       type: string
 *                       example: "piqueteaderodonjuan"
 *                       description: Slug único del restaurante para URLs públicas
 *                     branch_id:
 *                       type: integer
 *                       example: 1
 *                       description: ID de la sucursal principal
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email o contraseña incorrectos"
 *       422:
 *         description: Campos requeridos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email y contraseña son requeridos"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', login);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar nuevo restaurante
 *     description: |
 *       Registro público de un nuevo restaurante en la plataforma.
 *       Crea automáticamente:
 *       - Un tenant (restaurante)
 *       - Una sucursal principal
 *       - Un usuario administrador
 *       - Una licencia de prueba de 3 días
 *       El slug se genera automáticamente a partir del nombre del establecimiento (solo letras y números).
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
 *                 description: Nombre del restaurante (requerido)
 *               admin_name:
 *                 type: string
 *                 example: "Admin"
 *                 description: Nombre del administrador (requerido)
 *               last_name:
 *                 type: string
 *                 example: "Punto"
 *                 description: Apellido del administrador (opcional)
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contacto@donpunto.com"
 *                 description: Email del administrador (requerido, único)
 *               phone:
 *                 type: string
 *                 example: "3001234567"
 *                 description: Teléfono de contacto (opcional)
 *               password:
 *                 type: string
 *                 example: "Password123!"
 *                 description: Contraseña del administrador (requerido, mín 8 caracteres)
 *     responses:
 *       201:
 *         description: Restaurante registrado exitosamente
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
 *                     tenant_name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     user_id:
 *                       type: integer
 *                     license_id:
 *                       type: integer
 *                     message:
 *                       type: string
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "El email ya está registrado"
 *       422:
 *         description: Campos requeridos faltantes o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Nombre del establecimiento, nombre del administrador, email y contraseña son requeridos"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', register);

export default router;
