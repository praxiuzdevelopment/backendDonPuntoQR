import { Branch, City, Schedule, Menu, Template, MenuCategory, MenuProduct, Category, Product, Tenant } from '../models/index.js';

/**
 * Contrato de renderizado de un menú.
 *
 * Es la ÚNICA forma que consumen las plantillas, y la consumen dos clientes:
 * la vista pública (con estos datos) y la previsualización del panel (que arma
 * el mismo objeto desde el formulario sin guardar). Mientras ambos usen esta
 * forma, la previsualización no puede mentir.
 *
 * Cambiar esta estructura es cambiar todas las plantillas: tratar como API.
 */

/** Datos de contacto: viven en la sucursal, no en el restaurante. */
const presentBranch = (branch) => {
  if (!branch) return null;
  return {
    branch_id:  branch.branch_id,
    name:       branch.name,
    address:    branch.address,
    city:       branch.city?.description ?? null,
    phone_1:    branch.phone_1,
    phone_2:    branch.phone_2,
    email:      branch.email,
    whatsapp:   branch.whatsapp_number,
    socials: {
      instagram: branch.instagram_url,
      facebook:  branch.facebook_url,
      tiktok:    branch.tiktok_url,
    },
    schedules: (branch.schedules ?? []).map((s) => ({
      day:        s.day,
      start_time: s.start_time,
      end_time:   s.end_time,
    })),
  };
};

const presentProduct = (product, link) => ({
  product_id:       product.product_id,
  name:             product.name,
  description:      product.description,
  price:            Number(product.price),
  image_url:        product.image_url,
  is_combo:         product.is_combo,
  // `available` combina el estado global del producto y el de este menú.
  available:        product.available && (link?.available ?? true),
  featured:         link?.featured ?? product.featured,
  show_description: link?.show_description ?? true,
});

/**
 * Arma el contrato a partir de un menú ya cargado con sus relaciones.
 * @param {object} params
 * @param {Menu}   params.menu     Menú con template, menu_categories y menu_products
 * @param {Tenant} params.tenant
 * @param {Branch} params.branch   Sucursal desde la que se escaneó, si se conoce
 * @param {object} [params.context]
 */
/**
 * Ordena los productos de una sección.
 *
 * Se aplica al renderizar y no al guardar: así el restaurante puede alternar
 * entre "como yo los ordené" y "por precio" sin perder su orden manual.
 */
const sortProducts = (products, criteria) => {
  switch (criteria) {
    case 'price_asc':
      return [...products].sort((a, b) => a.price - b.price);
    case 'price_desc':
      return [...products].sort((a, b) => b.price - a.price);
    case 'name':
      return [...products].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    default:
      return products; // 'custom': respeta el display_order guardado
  }
};

export const presentMenu = ({ menu, tenant, branch, context = null }) => {
  const categoryLinks = menu.menu_categories ?? [];
  const productLinks  = menu.menu_products ?? [];

  const productsByCategory = new Map();
  for (const link of productLinks) {
    const product = link.product;
    if (!product || !product.active) continue;
    const list = productsByCategory.get(product.category_id) ?? [];
    list.push({ product, link });
    productsByCategory.set(product.category_id, list);
  }

  const sections = categoryLinks
    .filter((link) => link.active && link.category?.active)
    .sort((a, b) => a.display_order - b.display_order)
    .map((link) => ({
      category_id: link.category_id,
      name:        link.category.name,
      description: link.category.description,
      products: sortProducts(
        (productsByCategory.get(link.category_id) ?? [])
          .sort((a, b) => a.link.display_order - b.link.display_order)
          .map(({ product, link: pl }) => presentProduct(product, pl)),
        menu.order_criteria
      ),
    }))
    // Una categoría sin productos visibles no aporta nada en el menú.
    .filter((section) => section.products.length > 0);

  return {
    restaurant: {
      name:     tenant.name,
      logo_url: tenant.logo_url,
      slug:     tenant.slug,
      branch:   presentBranch(branch),
    },
    menu: {
      menu_id:         menu.menu_id,
      name:            menu.name,
      primary_color:   menu.primary_color,
      secondary_color: menu.secondary_color,
      image_position:  menu.image_position,
      order_criteria:  menu.order_criteria,
    },
    template: {
      code_name: menu.template?.code_name ?? 'classic',
      name:      menu.template?.name ?? null,
      layout:    menu.template?.layout ?? {},
    },
    sections,
    context,
  };
};

/** Includes necesarios para que `presentMenu` tenga todo lo que necesita. */
export const menuRenderInclude = [
  { model: Template, as: 'template' },
  {
    model: MenuCategory,
    as: 'menu_categories',
    required: false,
    include: [{ model: Category, as: 'category' }],
  },
  {
    model: MenuProduct,
    as: 'menu_products',
    required: false,
    include: [{ model: Product, as: 'product' }],
  },
];

export const branchRenderInclude = [
  { model: City, as: 'city', attributes: ['city_id', 'description'] },
  { model: Schedule, as: 'schedules' },
];

export default { presentMenu, menuRenderInclude, branchRenderInclude };
