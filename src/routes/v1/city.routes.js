import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { listCities, getCity, createCity, updateCity } from '../../controllers/city.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cities
 *   description: Gestión de ciudades
 */

/**
 * @swagger
 * /api/v1/cities:
 *   get:
 *     summary: Listar todas las ciudades
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ciudades obtenida exitosamente
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
 *                       city_id:
 *                         type: integer
 *                         example: 1
 *                       description:
 *                         type: string
 *                         example: "Bogotá"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-28T10:30:00Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-28T10:30:00Z"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', listCities);

/**
 * @swagger
 * /api/v1/cities/{id}:
 *   get:
 *     summary: Obtener datos de una ciudad específica
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ciudad
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos de la ciudad obtenidos exitosamente
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
 *                     city_id:
 *                       type: integer
 *                       example: 1
 *                     description:
 *                       type: string
 *                       example: "Bogotá"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-28T10:30:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-28T10:30:00Z"
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Ciudad no encontrada
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
 *                   example: "Ciudad no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getCity);

/**
 * @swagger
 * /api/v1/cities:
 *   post:
 *     summary: Crear una nueva ciudad
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Bogotá"
 *                 description: Nombre o descripción de la ciudad (requerido, máx 100 caracteres)
 *           examples:
 *             ejemplo1:
 *               summary: Crear ciudad de Bogotá
 *               value:
 *                 description: "Bogotá"
 *     responses:
 *       201:
 *         description: Ciudad creada exitosamente
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
 *                     city_id:
 *                       type: integer
 *                       example: 1
 *                     description:
 *                       type: string
 *                       example: "Bogotá"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-28T10:30:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-28T10:30:00Z"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - se requiere rol de administrador
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
 *                   example: "Acceso denegado"
 *       422:
 *         description: Datos inválidos
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
 *                   example: "La descripción es requerida"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authenticate, requireRole('admin'), createCity);

/**
 * @swagger
 * /api/v1/cities/{id}:
 *   put:
 *     summary: Actualizar una ciudad existente
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ciudad a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Bogotá D.C."
 *                 description: Nombre o descripción de la ciudad (máx 100 caracteres)
 *           examples:
 *             ejemplo1:
 *               summary: Actualizar descripción de la ciudad
 *               value:
 *                 description: "Bogotá D.C."
 *     responses:
 *       200:
 *         description: Ciudad actualizada exitosamente
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
 *                     city_id:
 *                       type: integer
 *                       example: 1
 *                     description:
 *                       type: string
 *                       example: "Bogotá D.C."
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-28T10:30:00Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-28T10:35:00Z"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - se requiere rol de administrador
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
 *                   example: "Acceso denegado"
 *       404:
 *         description: Ciudad no encontrada
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
 *                   example: "Ciudad no encontrada"
 *       422:
 *         description: Datos inválidos
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
 *                   example: "La descripción no puede estar vacía"
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authenticate, requireRole('admin'), updateCity);

export default router;
