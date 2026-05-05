import { jest } from '@jest/globals';
import AppError from '../../src/utils/AppError.js';

// Define mocks before importing the service
jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: jest.fn(),
  }
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(),
  }
}));

const mockModels = {
  User: {
    scope: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
  },
  Tenant: {},
  License: {
    findOne: jest.fn(),
  },
  Role: {},
};

jest.unstable_mockModule('../../src/models/index.js', () => ({
  ...mockModels,
  User: mockModels.User,
  License: mockModels.License,
}));

// Now import the service and dependencies
const { default: authService } = await import('../../src/services/auth.service.js');
const { default: bcrypt } = await import('bcryptjs');
const { default: jwt } = await import('jsonwebtoken');
const { User, License } = await import('../../src/models/index.js');

describe('Auth Service', () => {
  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const mockUser = { user_id: 1, tenant_id: 1, role_id: 1, email: 'test@test.com' };
      const mockRole = { name: 'admin' };
      process.env.JWT_SECRET = 'secret';
      
      jwt.sign.mockReturnValue('mock-token');

      const token = authService.generateToken(mockUser, mockRole);

      expect(token).toBe('mock-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 1,
          role: 'admin',
        }),
        'secret',
        expect.any(Object)
      );
    });
  });

  describe('getLicenseData', () => {
    it('should return nulls if no tenantId provided', async () => {
      const result = await authService.getLicenseData(null);
      expect(result).toEqual({ days: null, end_date: null });
    });

    it('should return 0 days if no license found', async () => {
      License.findOne.mockResolvedValue(null);
      const result = await authService.getLicenseData(1);
      expect(result).toEqual({ days: 0, end_date: null });
    });

    it('should calculate remaining days correctly', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      License.findOne.mockResolvedValue({ end_date: futureDate.toISOString() });

      const result = await authService.getLicenseData(1);
      expect(result.days).toBe(5);
      expect(result.end_date).toBeDefined();
    });
  });

  describe('login', () => {
    const loginData = { email: 'test@test.com', password: 'password123' };

    it('should throw error if user not found', async () => {
      User.scope().findOne.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
    });

    it('should throw error if password does not match', async () => {
      User.scope().findOne.mockResolvedValue({ email: 'test@test.com', password_hash: 'hash' });
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow('Credenciales inválidas');
    });

    it('should return user data and token on successful login', async () => {
      const mockUser = {
        user_id: 1,
        name: 'Test User',
        role_id: 2,
        tenant_id: 1,
        password_hash: 'hash',
        role: { name: 'admin' },
        tenant: { name: 'Restaurant', slug: 'restaurant' }
      };
      User.scope().findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      License.findOne.mockResolvedValue({ end_date: futureDate.toISOString() });

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('token', 'mock-token');
      expect(result).toHaveProperty('restaurant_name', 'Restaurant');
      expect(result.license_days).toBe(10);
    });
  });
});

