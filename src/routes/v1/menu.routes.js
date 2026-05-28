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
 *     summary: Listar todos los menús del restaurante
 *     description: Obtiene la lista de todos los menús del restaurante autenticado, incluyendo menús permanentes y temporales.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de menús obtenida exitosamente
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
 *                       menu_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       template_id:
 *                         type: integer
 *                       primary_color:
 *                         type: string
 *                       secondary_color:
 *                         type: string
 *                       temporal:
 *                         type: boolean
 *                       start_date:
 *                         type: string
 *                         format: date
 *                       end_date:
 *                         type: string
 *                         format: date
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', listMenus);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   get:
 *     summary: Obtener detalle completo de un menú
 *     description: Obtiene la estructura completa de un menú incluyendo todas sus categorías y productos ordenados.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del menú
 *         example: 1
 *     responses:
 *       200:
 *         description: Menú detallado con estructura de categorías y productos
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
 *                     basics:
 *                       type: object
 *                       properties:
 *                         menu_id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         temporal:
 *                           type: boolean
 *                         start_date:
 *                           type: string
 *                           format: date
 *                         end_date:
 *                           type: string
 *                           format: date
 *                         active:
 *                           type: boolean
 *                     appearance:
 *                       type: object
 *                       properties:
 *                         template_id:
 *                           type: integer
 *                         primary_color:
 *                           type: string
 *                         secondary_color:
 *                           type: string
 *                     sections:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category_id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           display_order:
 *                             type: integer
 *                           products:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 product_id:
 *                                   type: integer
 *                                 name:
 *                                   type: string
 *                                 price:
 *                                   type: number
 *                                 available:
 *                                   type: boolean
 *                                 featured:
 *                                   type: boolean
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Menú no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/v1/menus:
 *   post:
 *     summary: Crear un nuevo menú
 *     description: Crea un nuevo menú basado en una plantilla seleccionada. Puede ser permanente o temporal.
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
 *                 example: "Menú Principal"
 *                 description: Nombre del menú (requerido)
 *               template_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID de la plantilla a utilizar (requerido)
 *               primary_color:
 *                 type: string
 *                 example: "#FF5733"
 *                 description: Color primario (opcional)
 *               secondary_color:
 *                 type: string
 *                 example: "#33FF57"
 *                 description: Color secundario (opcional)
 *               temporal:
 *                 type: boolean
 *                 example: false
 *                 description: Indica si es un menú temporal (opcional, defecto false)
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-24"
 *                 description: Fecha de inicio si es temporal (formato YYYY-MM-DD)
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-31"
 *                 description: Fecha de fin si es temporal (formato YYYY-MM-DD)
 *     responses:
 *       201:
 *         description: Menú creado exitosamente
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
 *                     menu_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     template_id:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       422:
 *         description: Datos inválidos - name y template_id son requeridos
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/v1/menus/{id}/structure:
 *   put:
 *     summary: Actualizar estructura del menú
 *     description: Actualiza completamente la estructura del menú (categorías y productos). Realiza la operación de forma transaccional - borra y re-crea todas las asociaciones.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del menú
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sections]
 *             properties:
 *               sections:
 *                 type: array
 *                 description: Array de secciones (categorías) con sus productos ordenados
 *                 items:
 *                   type: object
 *                   required: [category_id]
 *                   properties:
 *                     category_id:
 *                       type: integer
 *                       example: 1
 *                       description: ID de la categoría
 *                     products:
 *                       type: array
 *                       description: Productos dentro de esta categoría
 *                       items:
 *                         type: object
 *                         required: [product_id]
 *                         properties:
 *                           product_id:
 *                             type: integer
 *                             example: 10
 *                             description: ID del producto
 *                           show_description:
 *                             type: boolean
 *                             example: true
 *                             description: Mostrar descripción del producto
 *                           featured:
 *                             type: boolean
 *                             example: false
 *                             description: Marcar como destacado
 *     responses:
 *       200:
 *         description: Estructura del menú actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estructura del menú actualizada correctamente"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Menú no encontrado
 *       422:
 *         description: Datos inválidos - sections debe ser un arreglo
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getMenuDetail);
router.post('/', createMenu);

router.put('/:id/structure', updateMenuStructure);

export default router;
