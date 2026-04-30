import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { listCategories, createCategory, updateCategory, toggleCategoryStatus } from '../../controllers/category.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestión de categorías del menú
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Listar todas las categorías del restaurante
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/', listCategories);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Crear una categoría
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada
 */
router.post('/', createCategory);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [Categories]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoría actualizada
 */
router.put('/:id', updateCategory);

/**
 * @swagger
 * /api/v1/categories/{id}/toggle:
 *   patch:
 *     summary: Activar o desactivar categoría
 *     tags: [Categories]
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
 */
router.patch('/:id/toggle', toggleCategoryStatus);

export default router;
