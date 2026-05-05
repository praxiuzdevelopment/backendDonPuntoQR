import { jest } from '@jest/globals';
import AppError from '../../src/utils/AppError.js';

// Mock auditLogger
jest.unstable_mockModule('../../src/utils/auditLogger.js', () => ({
  logAction: jest.fn().mockResolvedValue(true),
}));

// Mock Cloudinary
jest.unstable_mockModule('../../src/config/cloudinary.js', () => ({
  default: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'http://mock-image.url' }),
    },
  }
}));

// Mock Models
const mockModels = {
  Product: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Category: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
};

jest.unstable_mockModule('../../src/models/index.js', () => ({
  Product: mockModels.Product,
  Category: mockModels.Category,
}));

const { default: productService } = await import('../../src/services/product.service.js');
const { Product, Category } = await import('../../src/models/index.js');
const { logAction } = await import('../../src/utils/auditLogger.js');
const { default: cloudinary } = await import('../../src/config/cloudinary.js');

describe('Product Service', () => {
  const tenantId = 1;
  const actorId = 100;
  const ip = '127.0.0.1';

  describe('listProducts', () => {
    it('should return products ordered by sort_order and handle auto-restock', async () => {
      const mockProduct = {
        name: 'Burger',
        available: false,
        sort_order: 1,
        restock_at: new Date(Date.now() - 1000), // In the past
        update: jest.fn().mockResolvedValue(true)
      };
      Product.findAll.mockResolvedValue([mockProduct]);

      const result = await productService.listProducts(tenantId);

      expect(Product.findAll).toHaveBeenCalledWith(expect.objectContaining({
        order: [['sort_order', 'ASC'], ['name', 'ASC']]
      }));
      expect(mockProduct.update).toHaveBeenCalledWith(expect.objectContaining({ available: true }));
      expect(result[0].available).toBe(true);
    });
  });

  describe('createProduct', () => {
    it('should create product with sort_order and image upload', async () => {
      const data = { name: 'Pizza', price: 10, category_id: 1, sort_order: 3 };
      const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/png' };
      Product.create.mockResolvedValue({ product_id: 1, ...data, image_url: 'http://mock-image.url' });

      const result = await productService.createProduct(tenantId, data, mockFile, actorId, ip);

      expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Pizza',
        sort_order: 3,
        image_url: 'http://mock-image.url'
      }));
    });
  });

  describe('toggleStock', () => {
    it('should update availability and restock info', async () => {
      const mockProduct = { product_id: 1, update: jest.fn().mockReturnThis() };
      Product.findOne.mockResolvedValue(mockProduct);

      const stockData = { available: false, restock_at: '2026-01-01', restock_qty: 10 };
      await productService.toggleStock(tenantId, 1, stockData, actorId, ip);

      expect(mockProduct.update).toHaveBeenCalledWith(expect.objectContaining({
        available: false,
        restock_qty: 10
      }));
    });
  });
});
