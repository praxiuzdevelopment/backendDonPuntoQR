import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { optionalAuthenticate } from '../../middlewares/optionalAuth.js';
import { requireSuperAdmin } from '../../middlewares/requireSuperAdmin.js';
import {
  listCities,
  getCity,
  createCity,
  updateCity,
  toggleCityStatus,
} from '../../controllers/city.controller.js';

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
router.get('/', optionalAuthenticate, listCities);

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
router.post('/', authenticate, requireSuperAdmin, createCity);

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
router.put('/:id', authenticate, requireSuperAdmin, updateCity);

/**
 * @swagger
 * /api/v1/cities/{id}/toggle:
 *   patch:
 *     summary: Activar o deshabilitar una ciudad
 *     description: |
 *       Las ciudades no se eliminan porque `branch.city_id` las referencia.
 *       Al deshabilitarlas dejan de ofrecerse al asignar sucursales, pero las
 *       que ya la tenían conservan su dato.
 *     tags: [Cities]
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
 *         description: Estado actualizado
 *       403:
 *         description: Ruta exclusiva del equipo DonPunto
 *       404:
 *         description: Ciudad no encontrada
 *       422:
 *         description: El campo active debe ser boolean
 */
router.patch('/:id/toggle', authenticate, requireSuperAdmin, toggleCityStatus);

export default router;
