import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { listCategories, getCategory, createCategory, updateCategory, toggleCategoryStatus } from '../../controllers/category.controller.js';

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
 *     description: Obtiene todas las categorías del menú asociadas al restaurante del usuario autenticado, ordenadas por orden de visualización y nombre.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
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
 *                       category_id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Comidas Rápidas"
 *                       description:
 *                         type: string
 *                         example: "Hamburguesas, perros calientes y más"
 *                       sort_order:
 *                         type: integer
 *                         example: 0
 *                       active:
 *                         type: boolean
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado - token inválido o expirado
 *       403:
 *         description: Acceso denegado - se requiere rol de administrador
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', listCategories);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Obtener datos de una categoría específica
 *     description: Obtiene los detalles completos de una categoría específica del menú.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos de la categoría obtenidos exitosamente
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
 *                     category_id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Comidas Rápidas"
 *                     description:
 *                       type: string
 *                       example: "Hamburguesas, perros calientes y más"
 *                     sort_order:
 *                       type: integer
 *                       example: 0
 *                     active:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: No autorizado - token inválido o expirado
 *       403:
 *         description: Acceso denegado - se requiere rol de administrador
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     description: Crea una nueva categoría en el menú del restaurante autenticado.
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
 *                 example: "Bebidas"
 *                 description: Nombre de la categoría (requerido)
 *               description:
 *                 type: string
 *                 example: "Gaseosas, cervezas, vinos y licores"
 *                 description: Descripción de la categoría (opcional)
 *               sort_order:
 *                 type: integer
 *                 example: 1
 *                 description: Orden de visualización (opcional, por defecto 0)
 *               active:
 *                 type: boolean
 *                 example: true
 *                 description: Indica si la categoría está activa (opcional, por defecto true)
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
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
 *                     category_id:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                     sort_order:
 *                       type: integer
 *                     active:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       422:
 *         description: Datos inválidos - el nombre es requerido
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Actualizar una categoría existente
 *     description: Actualiza los datos de una categoría existente en el menú.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría a actualizar
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
 *                 example: "Bebidas Frías"
 *                 description: Nuevo nombre de la categoría (opcional)
 *               description:
 *                 type: string
 *                 example: "Gaseosas, cervezas y refrescos fríos"
 *                 description: Nueva descripción (opcional)
 *               sort_order:
 *                 type: integer
 *                 example: 2
 *                 description: Nuevo orden de visualización (opcional)
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
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
 *                     category_id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Bebidas Frías"
 *                     description:
 *                       type: string
 *                       example: "Gaseosas, cervezas y refrescos fríos"
 *                     sort_order:
 *                       type: integer
 *                       example: 2
 *                     active:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: No autorizado - token inválido o expirado
 *       403:
 *         description: Acceso denegado - se requiere rol de administrador
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getCategory);
router.post('/', createCategory);

router.put('/:id', updateCategory);

/**
 * @swagger
 * /api/v1/categories/{id}/toggle:
 *   patch:
 *     summary: Activar o desactivar categoría
 *     description: Cambia el estado (activa/inactiva) de una categoría del menú.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
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
 *                 description: Nuevo estado de la categoría (requerido)
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
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
 *                     category_id:
 *                       type: integer
 *                       example: 1
 *                     active:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: No autorizado - token inválido o expirado
 *       403:
 *         description: Acceso denegado - se requiere rol de administrador
 *       404:
 *         description: Categoría no encontrada
 *       422:
 *         description: El campo active debe ser boolean
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/toggle', toggleCategoryStatus);

export default router;
