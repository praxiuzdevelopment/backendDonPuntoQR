import { Router } from 'express';
import { generateQRCode, listQRCodes, getMenuQRCode, toggleQRCodeStatus, setQRCodeMode, deleteQRCode } from '../../controllers/qr.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { requireActiveService } from '../../middlewares/requireActiveService.js';

const router = Router();

// `requireRole` compara contra una jerarquía y espera un único rol: pasarle un
// array daba `undefined` y devolvía 403 en todas las rutas de QR.
router.use(authenticate);
router.use(requireActiveService);
router.use(requireRole('admin'));

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

/**
 * @swagger
 * /api/v1/qr/menu/{menuId}:
 *   get:
 *     summary: Código QR de un menú
 *     description: Devuelve el QR asociado al menú con su imagen redibujada. 404 si aún no tiene.
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Código QR encontrado
 *       404:
 *         description: El menú no tiene código QR
 */
router.get('/menu/:menuId', getMenuQRCode);

/**
 * @swagger
 * /api/v1/qr/{id}/toggle:
 *   patch:
 *     summary: Habilitar o inhabilitar un código QR
 *     description: Un QR inhabilitado deja de servir el menú, pero el código se conserva y puede reactivarse.
 *     tags: [QR Codes]
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
 *       404:
 *         description: Código QR no encontrado
 *       422:
 *         description: El campo active debe ser boolean
 */
router.patch('/:id/toggle', toggleQRCodeStatus);

/**
 * @swagger
 * /api/v1/qr/{id}:
 *   delete:
 *     summary: Eliminar un código QR
 *     description: |
 *       Borra el código de forma definitiva. Cualquier QR ya impreso con ese
 *       código queda inservible: para retirarlo temporalmente usa el toggle.
 *     tags: [QR Codes]
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
 *         description: Código QR eliminado
 *       404:
 *         description: Código QR no encontrado
 */
router.patch('/:id/mode', setQRCodeMode);

router.delete('/:id', deleteQRCode);

export default router;
