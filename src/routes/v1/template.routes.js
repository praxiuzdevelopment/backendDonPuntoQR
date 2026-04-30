import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { listTemplates } from '../../controllers/template.controller.js';

const router = Router();

// Endpoint público para listar plantillas o protegido (depende si los comensales las ven, pero generalmente solo admin)
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Templates
 *   description: Plantillas visuales para menús
 */

/**
 * @swagger
 * /api/v1/templates:
 *   get:
 *     summary: Listar plantillas disponibles
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de plantillas
 */
router.get('/', listTemplates);

export default router;
