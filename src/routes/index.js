import { Router } from 'express';
import authRoutes from './v1/auth.routes.js';
import adminRoutes from './v1/admin.routes.js';
import userRoutes from './v1/user.routes.js';
import branchRoutes from './v1/branch.routes.js';
import categoryRoutes from './v1/category.routes.js';
import productRoutes from './v1/product.routes.js';
import templateRoutes from './v1/template.routes.js';
import menuRoutes from './v1/menu.routes.js';

const router = Router();

router.use('/api/v1/auth',  authRoutes);
router.use('/api/v1/admin', adminRoutes);
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/branches', branchRoutes);
router.use('/api/v1/categories', categoryRoutes);
router.use('/api/v1/products', productRoutes);
router.use('/api/v1/templates', templateRoutes);
router.use('/api/v1/menus', menuRoutes);

export default router;
