import { jest } from '@jest/globals';
import AppError from '../../src/utils/AppError.js';

// Mock auditLogger
jest.unstable_mockModule('../../src/utils/auditLogger.js', () => ({
  logAction: jest.fn().mockResolvedValue(true),
}));

// Mock Models
const mockModels = {
  Category: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
};

jest.unstable_mockModule('../../src/models/index.js', () => ({
  Category: mockModels.Category,
}));

const { default: categoryService } = await import('../../src/services/category.service.js');
const { Category } = await import('../../src/models/index.js');
const { logAction } = await import('../../src/utils/auditLogger.js');

describe('Category Service', () => {
  const tenantId = 1;
  const actorId = 100;
  const ip = '127.0.0.1';

  describe('listCategories', () => {
    it('should return categories for the tenant ordered by sort_order', async () => {
      Category.findAll.mockResolvedValue([{ name: 'A', sort_order: 1 }, { name: 'B', sort_order: 0 }]);
      const result = await categoryService.listCategories(tenantId);
      expect(Category.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { tenant_id: tenantId },
        order: [['sort_order', 'ASC'], ['name', 'ASC']]
      }));
      expect(result).toHaveLength(2);
    });
  });

  describe('createCategory', () => {
    it('should create a category with sort_order and log the action', async () => {
      const data = { name: 'Lunch', description: 'Afternoon meals', sort_order: 5 };
      Category.create.mockResolvedValue({ category_id: 1, ...data });

      const result = await categoryService.createCategory(tenantId, data, actorId, ip);

      expect(Category.create).toHaveBeenCalledWith(expect.objectContaining({
        tenant_id: tenantId,
        name: 'Lunch',
        sort_order: 5
      }));
      expect(logAction).toHaveBeenCalled();
      expect(result.name).toBe('Lunch');
    });
  });

  describe('updateCategory', () => {
    it('should update sort_order of an existing category', async () => {
      const mockCategory = {
        category_id: 1,
        name: 'Old Name',
        sort_order: 0,
        update: jest.fn().mockReturnThis()
      };
      Category.findOne.mockResolvedValue(mockCategory);

      await categoryService.updateCategory(tenantId, 1, { sort_order: 10 }, actorId, ip);

      expect(mockCategory.update).toHaveBeenCalledWith(expect.objectContaining({ sort_order: 10 }));
      expect(logAction).toHaveBeenCalled();
    });

    it('should throw error if category not found', async () => {
      Category.findOne.mockResolvedValue(null);
      await expect(categoryService.updateCategory(tenantId, 999, {}, actorId, ip)).rejects.toThrow('Categoría no encontrada');
    });
  });
});
