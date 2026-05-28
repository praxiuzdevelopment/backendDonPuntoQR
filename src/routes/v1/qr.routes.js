import { Router } from 'express';
import { generateQRCode, listQRCodes } from '../../controllers/qr.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';

const router = Router();

// Todas las rutas de QR requieren autenticación y rol de admin/manager
router.use(authenticate);
router.use(requireRole(['admin', 'manager']));

/**
 * @swagger
 * tags:
 *   name: QR Codes
 *   description: Gestión de códigos QR para mesas y menús
 */

/**
 * @swagger
 * /api/v1/qr/generate:
 *   post:
 *     summary: Generar un nuevo código QR
 *     description: |
 *       Genera un código QR general o específico por mesa para el restaurante.
 *       Retorna la imagen del QR en Base64 y la URL pública del menú asociado.
 *       Si no se envía `table_number`, el QR apunta al menú general del restaurante.
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               table_number:
 *                 type: string
 *                 example: "Mesa 5"
 *                 description: Identificador de la mesa (opcional). Si se omite, se genera un QR general.
 *               color:
 *                 type: string
 *                 example: "#FF5733"
 *                 description: Color del QR en formato hexadecimal (opcional, por defecto negro)
 *           examples:
 *             qrGeneral:
 *               summary: QR general del restaurante
 *               value:
 *                 color: "#000000"
 *             qrMesa:
 *               summary: QR para una mesa específica
 *               value:
 *                 table_number: "Mesa 5"
 *                 color: "#FF5733"
 *     responses:
 *       201:
 *         description: Código QR generado exitosamente
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
 *                     qr_id:
 *                       type: integer
 *                     unique_code:
 *                       type: string
 *                     table_number:
 *                       type: string
 *                       nullable: true
 *                     qr_image:
 *                       type: string
 *                       description: Imagen del QR en formato Base64 (data:image/png;base64,...)
 *                     menu_url:
 *                       type: string
 *                       format: uri
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - se requiere rol admin o manager
 *       500:
 *         description: Error interno del servidor
 */
router.post('/generate', generateQRCode);

/**
 * @swagger
 * /api/v1/qr:
 *   get:
 *     summary: Listar códigos QR generados
 *     description: Obtiene la lista de todos los códigos QR generados para el restaurante autenticado, incluyendo el código único, mesa asociada y URL del menú.
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de códigos QR obtenida exitosamente
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
 *                       qr_id:
 *                         type: integer
 *                       unique_code:
 *                         type: string
 *                       table_number:
 *                         type: string
 *                         nullable: true
 *                       menu_url:
 *                         type: string
 *                       active:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', listQRCodes);

export default router;
