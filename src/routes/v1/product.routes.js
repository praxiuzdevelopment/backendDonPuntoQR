import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { upload } from '../../middlewares/upload.js';
import { listProducts, getProduct, createProduct, updateProduct, toggleStock, bulkUpload } from '../../controllers/product.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestión de productos y carga masiva
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Listar productos del tenant (con auto-restock)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', listProducts);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Obtener datos de un producto específico
 *     tags: [Products]
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
 *         description: Datos del producto
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Crear un producto (soporta imagen vía multipart/form-data)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, category_id, price]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               price:
 *                 type: number
 *               active:
 *                 type: boolean
 *                 default: true
 *               featured:
 *                 type: boolean
 *                 default: false
 *               available:
 *                 type: boolean
 *                 default: true
 *               is_combo:
 *                 type: boolean
 *                 default: false
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post('/', upload.single('image'), createProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Actualizar un producto (soporta imagen)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Producto actualizado
 */
router.put('/:id', upload.single('image'), updateProduct);

/**
 * @swagger
 * /api/v1/products/{id}/stock:
 *   patch:
 *     summary: Marcar agotado y configurar restock
 *     tags: [Products]
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
 *             required: [available]
 *             properties:
 *               available:
 *                 type: boolean
 *               restock_at:
 *                 type: string
 *                 format: date-time
 *               restock_qty:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock actualizado
 */
router.patch('/:id/stock', toggleStock);

/**
 * @swagger
 * /api/v1/products/bulk:
 *   post:
 *     summary: Carga masiva de productos vía CSV o Excel
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Productos importados
 */
router.post('/bulk', upload.single('file'), bulkUpload);

export default router;
