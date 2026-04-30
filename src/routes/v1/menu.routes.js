import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { listMenus, getMenuDetail, createMenu, updateMenuStructure } from '../../controllers/menu.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Gestión de menús visuales
 */

/**
 * @swagger
 * /api/v1/menus:
 *   get:
 *     summary: Listar menús del restaurante
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de menús
 */
router.get('/', listMenus);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   get:
 *     summary: Obtener el detalle y estructura de un menú
 *     tags: [Menus]
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
 *         description: Menú detallado con categorías y productos ordenados
 */
router.get('/:id', getMenuDetail);

/**
 * @swagger
 * /api/v1/menus:
 *   post:
 *     summary: Crear un menú base
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, template_id]
 *             properties:
 *               name:
 *                 type: string
 *               template_id:
 *                 type: integer
 *               primary_color:
 *                 type: string
 *               secondary_color:
 *                 type: string
 *               temporal:
 *                 type: boolean
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Menú creado
 */
router.post('/', createMenu);

/**
 * @swagger
 * /api/v1/menus/{id}/structure:
 *   put:
 *     summary: Actualizar la estructura (orden) del menú
 *     description: Borra y re-crea transaccionalmente las asociaciones de categorías y productos.
 *     tags: [Menus]
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
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category_id:
 *                       type: integer
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_id:
 *                             type: integer
 *                           show_description:
 *                             type: boolean
 *                           featured:
 *                             type: boolean
 *     responses:
 *       200:
 *         description: Estructura actualizada
 */
router.put('/:id/structure', updateMenuStructure);

export default router;
