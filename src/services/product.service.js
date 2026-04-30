import { Op } from 'sequelize';
import csvParser from 'csv-parser';
import * as xlsx from 'xlsx';
import cloudinary from '../config/cloudinary.js';
import { Product, Category } from '../models/index.js';
import { logAction } from '../utils/auditLogger.js';
import { Readable } from 'stream';

export const listProducts = async (tenantId) => {
  const products = await Product.findAll({
    where: { tenant_id: tenantId },
    include: [{ model: Category, as: 'category', attributes: ['name'] }],
    order: [['name', 'ASC']],
  });

  // Lógica de auto-restock: si restock_at <= NOW(), available = true
  const now = new Date();
  const updatedProducts = await Promise.all(
    products.map(async (product) => {
      if (!product.available && product.restock_at && product.restock_at <= now) {
        await product.update({ available: true, restock_at: null, restock_qty: null });
        product.available = true;
      }
      return product;
    })
  );

  return updatedProducts;
};

export const createProduct = async (tenantId, data, file, actorId, ipAddress) => {
  let image_url = null;

  if (file) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: `menuqr/${tenantId}/products`,
    });
    image_url = uploadResult.secure_url;
  }

  const { name, description, category_id, price, featured, available, is_combo, active } = data;

  const product = await Product.create({
    tenant_id: tenantId,
    category_id,
    name,
    description,
    price,
    image_url,
    featured: featured || false,
    available: available !== undefined ? available : true,
    is_combo: is_combo || false,
    active: active !== undefined ? active : true,
  });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'product',
    record_id: product.product_id,
    action: 'INSERT',
    new_values: { name, category_id, price },
    ip_address: ipAddress,
  });

  return product;
};

export const updateProduct = async (tenantId, productId, data, file, actorId, ipAddress) => {
  const product = await Product.findOne({ where: { product_id: productId, tenant_id: tenantId } });
  if (!product) throw { status: 404, message: 'Producto no encontrado' };

  let image_url = product.image_url;
  if (file) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: `menuqr/${tenantId}/products`,
    });
    image_url = uploadResult.secure_url;
  }

  const { name, description, category_id, price, featured, available, is_combo, active } = data;

  const oldValues = {
    name: product.name, description: product.description, category_id: product.category_id,
    price: product.price, image_url: product.image_url, featured: product.featured,
    available: product.available, is_combo: product.is_combo, active: product.active
  };

  await product.update({
    name: name !== undefined ? name : product.name,
    description: description !== undefined ? description : product.description,
    category_id: category_id !== undefined ? category_id : product.category_id,
    price: price !== undefined ? price : product.price,
    image_url,
    featured: featured !== undefined ? featured : product.featured,
    available: available !== undefined ? available : product.available,
    is_combo: is_combo !== undefined ? is_combo : product.is_combo,
    active: active !== undefined ? active : product.active,
  });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'product',
    record_id: product.product_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: { name: product.name, price: product.price },
    ip_address: ipAddress,
  });

  return product;
};

export const toggleStock = async (tenantId, productId, data, actorId, ipAddress) => {
  const product = await Product.findOne({ where: { product_id: productId, tenant_id: tenantId } });
  if (!product) throw { status: 404, message: 'Producto no encontrado' };

  const { available, restock_at, restock_qty } = data;
  const oldValues = { available: product.available, restock_at: product.restock_at, restock_qty: product.restock_qty };

  await product.update({
    available,
    restock_at: restock_at || null,
    restock_qty: restock_qty || null,
  });

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'product',
    record_id: product.product_id,
    action: 'UPDATE',
    old_values: oldValues,
    new_values: { available, restock_at, restock_qty },
    ip_address: ipAddress,
  });

  return { product_id: product.product_id, available, restock_at, restock_qty };
};

export const bulkUpload = async (tenantId, file, actorId, ipAddress) => {
  if (!file) throw { status: 400, message: 'Archivo requerido' };

  const productsData = [];

  if (file.mimetype === 'text/csv') {
    const stream = Readable.from(file.buffer.toString('utf-8'));
    await new Promise((resolve, reject) => {
      stream.pipe(csvParser())
        .on('data', (row) => productsData.push(row))
        .on('end', resolve)
        .on('error', reject);
    });
  } else {
    // Es Excel
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);
    productsData.push(...rows);
  }

  if (productsData.length === 0) throw { status: 400, message: 'El archivo está vacío' };

  let insertedCount = 0;

  // Extraer nombres de categoría únicos para buscarlos o crearlos
  const categoryNames = [...new Set(productsData.map(p => p.category_name).filter(Boolean))];
  const categories = await Category.findAll({ where: { tenant_id: tenantId, name: { [Op.in]: categoryNames } } });
  
  // Crear un mapa de nombre_categoria -> id
  const categoryMap = new Map();
  categories.forEach(c => categoryMap.set(c.name.toLowerCase(), c.category_id));

  // Crear categorías faltantes (opcional, si se desea. Aquí asumiremos que las creamos)
  for (const name of categoryNames) {
    if (!categoryMap.has(name.toLowerCase())) {
      const newCat = await Category.create({ tenant_id: tenantId, name, active: true });
      categoryMap.set(name.toLowerCase(), newCat.category_id);
    }
  }

  for (const row of productsData) {
    if (!row.name || !row.price || !row.category_name) continue;

    const category_id = categoryMap.get(row.category_name.toLowerCase());
    if (!category_id) continue;

    await Product.create({
      tenant_id: tenantId,
      category_id,
      name: row.name,
      description: row.description || null,
      price: parseFloat(row.price),
      active: true,
      available: true,
    });
    insertedCount++;
  }

  await logAction({
    tenant_id: tenantId,
    user_id: actorId,
    table_name: 'product',
    action: 'BULK_INSERT',
    new_values: { inserted_count: insertedCount },
    ip_address: ipAddress,
  });

  return { message: `${insertedCount} productos importados correctamente.` };
};

export default { listProducts, createProduct, updateProduct, toggleStock, bulkUpload };
