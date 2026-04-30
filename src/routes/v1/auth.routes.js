import { Router } from 'express';
import { login } from '../../controllers/auth.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación de usuarios
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
 *                     slug:
 *                       type: string
 *                       example: "piqueteadero-don-juan"
 *       401:
 *         description: Credenciales inválidas
 *       422:
 *         description: Campos requeridos faltantes
 */
router.post('/login', login);

export default router;
