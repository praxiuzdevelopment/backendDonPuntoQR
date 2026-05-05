import { jest } from '@jest/globals';
import AppError from '../../src/utils/AppError.js';

// Mock bcrypt
jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: jest.fn().mockResolvedValue('hashed_password'),
  }
}));

// Mock Models
const mockModels = {
  sequelize: {
    transaction: jest.fn(callback => callback('transaction_obj')),
  },
  Tenant: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  License: {
    create: jest.fn(),
    upsert: jest.fn(),
  },
  Role: {
    findOne: jest.fn(),
  },
  Branch: {
    create: jest.fn(),
  },
};

jest.unstable_mockModule('../../src/models/index.js', () => ({
  ...mockModels,
  Tenant: mockModels.Tenant,
  User: mockModels.User,
  License: mockModels.License,
  Role: mockModels.Role,
  Branch: mockModels.Branch,
  sequelize: mockModels.sequelize,
}));

const { default: adminService } = await import('../../src/services/admin.service.js');
const { Tenant, User, Role, License, Branch, sequelize } = await import('../../src/models/index.js');
const { default: bcrypt } = await import('bcryptjs');

describe('Admin Service', () => {
  describe('createTenant', () => {
    const validData = {
      establishment_name: 'Don Punto!',
      admin_name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
    };

    it('should throw error if email already exists', async () => {
      User.findOne.mockResolvedValue({ id: 1 });
      await expect(adminService.createTenant(validData)).rejects.toThrow('El email ya está registrado');
    });

    it('should throw error if admin role not found', async () => {
      User.findOne.mockResolvedValue(null);
      Role.findOne.mockResolvedValue(null);
      await expect(adminService.createTenant(validData)).rejects.toThrow('Rol admin no encontrado');
    });

    it('should create tenant, user, branch and license', async () => {
      User.findOne.mockResolvedValue(null);
      Tenant.findOne.mockResolvedValue(null); // for slug check
      Role.findOne.mockResolvedValue({ role_id: 1 });
      
      Tenant.create.mockResolvedValue({ tenant_id: 1, slug: 'donpunto' });
      User.create.mockResolvedValue({ user_id: 1 });
      License.create.mockResolvedValue({ end_date: new Date() });

      const result = await adminService.createTenant(validData);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(Tenant.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Don Punto!', slug: 'donpunto' }),
        expect.any(Object)
      );
      expect(Branch.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Sede Principal' }),
        expect.any(Object)
      );
      expect(result).toHaveProperty('slug', 'donpunto');
    });

    it('should handle duplicate slugs by adding a counter', async () => {
      User.findOne.mockResolvedValue(null);
      Role.findOne.mockResolvedValue({ role_id: 1 });
      
      // First check finds existing slug, second check finds nothing
      Tenant.findOne
        .mockResolvedValueOnce({ tenant_id: 100 })
        .mockResolvedValueOnce(null);

      Tenant.create.mockResolvedValue({ tenant_id: 1, slug: 'donpunto-1' });
      User.create.mockResolvedValue({ user_id: 1 });
      License.create.mockResolvedValue({ end_date: new Date() });

      const result = await adminService.createTenant(validData);
      expect(result.slug).toBe('donpunto-1');
    });
  });

  describe('setTenantStatus', () => {
    it('should throw error if tenant not found', async () => {
      Tenant.findByPk.mockResolvedValue(null);
      await expect(adminService.setTenantStatus(1, true)).rejects.toThrow('Tenant no encontrado');
    });

    it('should update tenant status', async () => {
      const mockTenant = { update: jest.fn() };
      Tenant.findByPk.mockResolvedValue(mockTenant);

      const result = await adminService.setTenantStatus(1, false);

      expect(mockTenant.update).toHaveBeenCalledWith({ active: false });
      expect(result).toEqual({ tenant_id: 1, active: false });
    });
  });
});
