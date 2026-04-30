import { Router } from 'express';
import { generateQRCode, listQRCodes } from '../../controllers/qr.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';

const router = Router();

// Todas las rutas de QR requieren autenticación y rol de admin/manager
router.use(authenticate);
router.use(requireRole(['admin', 'manager']));

router.post('/generate', generateQRCode);
router.get('/', listQRCodes);

export default router;
