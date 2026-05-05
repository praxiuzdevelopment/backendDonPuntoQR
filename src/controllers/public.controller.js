import { QRCode, Menu, Tenant, MenuCategory, MenuProduct, Category, Product } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Obtiene el menú completo escaneando el código QR
 */
export const getMenuByQRCode = catchAsync(async (req, res) => {
  const { code } = req.params;

  // Buscar el QR
  const qr = await QRCode.findOne({ where: { code, active: true } });
  if (!qr) {
    throw new AppError('El código QR es inválido o está desactivado', 404);
  }

  // Buscar el Restaurante
  const tenant = await Tenant.findByPk(qr.tenant_id);
  if (!tenant || !tenant.active) {
    throw new AppError('El restaurante no se encuentra disponible', 404);
  }

  // Si el QR tiene un menú específico, usarlo. Si no, buscar el menú activo del restaurante
  let menuQuery = { tenant_id: tenant.tenant_id, active: true };
  if (qr.menu_id) menuQuery.menu_id = qr.menu_id;

  const menu = await Menu.findOne({
    where: menuQuery,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: MenuCategory,
        as: 'menu_categories',
        where: { active: true },
        required: false,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['name', 'description']
          }
        ]
      },
      {
        model: MenuProduct,
        as: 'menu_products',
        where: { available: true },
        required: false,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['name', 'description', 'price', 'image_url', 'is_combo']
          }
        ]
      }
    ]
  });

  if (!menu) {
    throw new AppError('No hay menús activos disponibles para este código', 404);
  }

  // Formatear el mega JSON para el frontend
  // Agrupando productos por categoría
  const categoriesMap = {};
  
  menu.menu_categories.forEach(mc => {
    categoriesMap[mc.category_id] = {
      id: mc.category_id,
      name: mc.category.name,
      description: mc.category.description,
      display_order: mc.display_order,
      products: []
    };
  });

  menu.menu_products.forEach(mp => {
    const prod = mp.product;
    // Buscar a qué categoría pertenece el producto
    // En el modelo base Product tiene category_id
    // Como no lo incluimos arriba, vamos a estructurarlo de la forma más plana que sirva al frontend
    // Aquí idealmente Product debería incluir su category_id
  });

  // Para simplificar y dar una respuesta robusta, re-consultamos los productos organizados
  const fullMenuData = await Menu.findByPk(menu.menu_id, {
    attributes: ['name', 'primary_color', 'secondary_color', 'image_position'],
    include: [
      {
        model: MenuCategory,
        as: 'menu_categories',
        where: { active: true },
        required: false,
        include: [
          {
            model: Category,
            as: 'category',
            include: [
              {
                model: Product,
                as: 'products',
                where: { active: true, available: true },
                required: false,
                order: [['sort_order', 'ASC'], ['name', 'ASC']]
              }
            ]
          }
        ],
        order: [['display_order', 'ASC'], [{ model: Category, as: 'category' }, 'sort_order', 'ASC']]
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: {
      tenant: {
        name: tenant.name,
        logo_url: tenant.logo_url,
      },
      qr_info: {
        qr_type: qr.qr_type,
        table_number: qr.table_number
      },
      menu: fullMenuData
    }
  });
});

export default { getMenuByQRCode };
