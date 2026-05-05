import productService from '../services/product.service.js';

export const listProducts = async (req, res) => {
  try {
    const products = await productService.listProducts(req.user.tenant_id);
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('[product.controller] listProducts:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(req.user.tenant_id, id);
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[product.controller] getProduct:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category_id, price } = req.body;
    if (!name || !category_id || price === undefined) {
      return res.status(422).json({ success: false, message: 'name, category_id y price son requeridos' });
    }

    const result = await productService.createProduct(
      req.user.tenant_id,
      req.body,
      req.file,
      req.user.id,
      req.ip
    );
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('[product.controller] createProduct:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await productService.updateProduct(
      req.user.tenant_id,
      id,
      req.body,
      req.file,
      req.user.id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[product.controller] updateProduct:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const toggleStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      return res.status(422).json({ success: false, message: 'El campo available debe ser boolean' });
    }

    const result = await productService.toggleStock(
      req.user.tenant_id,
      id,
      req.body,
      req.user.id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[product.controller] toggleStock:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(422).json({ success: false, message: 'Se requiere un archivo CSV o Excel' });
    }

    const result = await productService.bulkUpload(
      req.user.tenant_id,
      req.file,
      req.user.id,
      req.ip
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[product.controller] bulkUpload:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { listProducts, createProduct, updateProduct, toggleStock, bulkUpload };
