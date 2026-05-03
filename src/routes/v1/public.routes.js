import { Router } from 'express';
import { getMenuByQRCode } from '../../controllers/public.controller.js';

const router = Router();

/**
 * @swagger
 * /api/v1/public/menus/{code}:
 *   get:
 *     summary: Obtener el menú escaneando un código QR
 *     tags: [Public]
 *     description: Retorna un JSON optimizado con todas las categorías y productos activos listos para ser renderizados por el Frontend del comensal. No requiere autenticación.
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: El código único del QR escaneado
 *     responses:
 *       200:
 *         description: Menú y configuración del restaurante obtenidos exitosamente
 *       404:
 *         description: Código inválido o restaurante inactivo
 */
// Rutas 100% públicas para el comensal. No requieren autenticación JWT.
router.get('/menus/:code', getMenuByQRCode);

export default router;
