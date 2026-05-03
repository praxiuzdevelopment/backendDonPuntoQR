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
 * /api/v1/qr/generate:
 *   post:
 *     summary: Genera un nuevo código QR
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     description: Genera un código QR general o específico por mesa para el restaurante. Retorna la imagen en Base64.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               table_number:
 *                 type: string
 *                 description: Número de la mesa (opcional)
 *               color:
 *                 type: string
 *                 description: Color en formato Hexadecimal (opcional, por defecto negro)
 *     responses:
 *       201:
 *         description: Código QR generado exitosamente
 */
router.post('/generate', generateQRCode);

/**
 * @swagger
 * /api/v1/qr:
 *   get:
 *     summary: Lista los códigos QR generados por el restaurante
 *     tags: [QR Codes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de códigos QR
 */
router.get('/', listQRCodes);

export default router;
