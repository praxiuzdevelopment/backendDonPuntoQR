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
 *     summary: Listar todos los productos del restaurante
 *     description: Obtiene la lista de todos los productos del restaurante autenticado. Se aplica automáticamente auto-restock si está configurado.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
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
 *                       product_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category_id:
 *                         type: integer
 *                       price:
 *                         type: number
 *                       active:
 *                         type: boolean
 *                       featured:
 *                         type: boolean
 *                       available:
 *                         type: boolean
 *                       is_combo:
 *                         type: boolean
 *                       image_url:
 *                         type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', listProducts);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Obtener datos de un producto específico
 *     description: Obtiene los detalles completos de un producto específico.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos del producto obtenidos exitosamente
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
 *                     product_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     category_id:
 *                       type: integer
 *                     price:
 *                       type: number
 *                     active:
 *                       type: boolean
 *                     featured:
 *                       type: boolean
 *                     available:
 *                       type: boolean
 *                     is_combo:
 *                       type: boolean
 *                     image_url:
 *                       type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     description: |
 *       Crea un nuevo producto en el catálogo del restaurante. Soporta carga de imagen en formato multipart/form-data.
 *       
 *       **Ejemplo de payload:**
 *       ```json
 *       {
 *         "name": "Hamburguesa Clásica",
 *         "description": "Hamburguesa con carne de res, queso y vegetales frescos",
 *         "category_id": 1,
 *         "price": 25000,
 *         "active": true,
 *         "featured": false,
 *         "available": true,
 *         "is_combo": false,
 *         "image": "<archivo binario>"
 *       }
 *       ```
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, category_id, price]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Hamburguesa Clásica"
 *                 description: Nombre del producto (requerido)
 *               description:
 *                 type: string
 *                 example: "Hamburguesa con carne de res, queso y vegetales frescos"
 *                 description: Descripción del producto (opcional)
 *               category_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID de la categoría (requerido)
 *               price:
 *                 type: number
 *                 example: 25000
 *                 description: Precio del producto (requerido)
 *               active:
 *                 type: boolean
 *                 example: true
 *                 description: Indica si el producto está activo (opcional, defecto true)
 *               featured:
 *                 type: boolean
 *                 example: false
 *                 description: Indica si el producto es destacado (opcional, defecto false)
 *               available:
 *                 type: boolean
 *                 example: true
 *                 description: Indica si el producto está disponible (opcional, defecto true)
 *               is_combo:
 *                 type: boolean
 *                 example: false
 *                 description: Indica si el producto es un combo (opcional, defecto false)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del producto (opcional, máx 5MB)
 *           examples:
 *             productoBasico:
 *               summary: Producto básico sin imagen
 *               value:
 *                 name: "Café Americano"
 *                 category_id: 2
 *                 price: 8000
 *                 description: "Café puro recién preparado"
 *                 active: true
 *                 featured: false
 *                 available: true
 *                 is_combo: false
 *             productoCombinado:
 *               summary: Producto combo con imagen
 *               value:
 *                 name: "Combo Clásico"
 *                 category_id: 3
 *                 price: 45000
 *                 description: "Hamburguesa + Papas + Bebida + Postre"
 *                 active: true
 *                 featured: true
 *                 available: true
 *                 is_combo: true
 *                 image: "(archivo binario)"
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
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
 *                     product_id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     image_url:
 *                       type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       422:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', upload.single('image'), createProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Actualizar un producto existente
 *     description: Actualiza los datos de un producto existente. Soporta carga de imagen en formato multipart/form-data.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Hamburguesa Deluxe"
 *               description:
 *                 type: string
 *                 example: "Hamburguesa premium con ingredientes especiales"
 *               price:
 *                 type: number
 *                 example: 35000
 *               active:
 *                 type: boolean
 *               featured:
 *                 type: boolean
 *               available:
 *                 type: boolean
 *               is_combo:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', upload.single('image'), updateProduct);

/**
 * @swagger
 * /api/v1/products/{id}/stock:
 *   patch:
 *     summary: Actualizar disponibilidad y restock de un producto
 *     description: Marca un producto como agotado o disponible, y configura la fecha y cantidad de restock si es necesario.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 1
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
 *                 example: false
 *                 description: Indica si el producto está disponible (requerido)
 *               restock_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-05-25T18:00:00Z"
 *                 description: Fecha en que estará disponible nuevamente (opcional)
 *               restock_qty:
 *                 type: integer
 *                 example: 50
 *                 description: Cantidad a reponer en restock (opcional)
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Producto no encontrado
 *       422:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/stock', toggleStock);

/**
 * @swagger
 * /api/v1/products/bulk:
 *   post:
 *     summary: Importar productos masivamente
 *     description: Importa múltiples productos desde un archivo CSV o Excel. El archivo debe contener columnas para nombre, descripción, categoría, precio, etc.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo CSV o Excel con los productos (máx 10MB)
 *     responses:
 *       200:
 *         description: Productos importados exitosamente
 *       400:
 *         description: Archivo inválido o formato no soportado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       422:
 *         description: Datos inválidos en el archivo
 *       500:
 *         description: Error interno del servidor
 */
router.post('/bulk', upload.single('file'), bulkUpload);

export default router;
