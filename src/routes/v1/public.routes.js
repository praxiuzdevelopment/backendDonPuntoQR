import { Router } from 'express';
import { getMenuByQRCode } from '../../controllers/public.controller.js';

const router = Router();

// Rutas 100% públicas para el comensal. No requieren autenticación JWT.
router.get('/menus/:code', getMenuByQRCode);

export default router;
