// // import { Test, TestingModule } from '@nestjs/testing'; // Removido - não utilizado // Removido - não utilizado
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { AuthController } from '../src/auth/auth.controller';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/entities/user.entity';
import { Profile } from '../src/users/entities/profile.entity';
import { CacheService } from '../src/core/cache/cache.service';
import { createTestingModule, createTestApp } from './setup';

// Mock CacheService
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  flush: jest.fn(),
  keys: jest.fn(),
  getUserCache: jest.fn(),
  setUserCache: jest.fn(),
  getServiceCache: jest.fn(),
  setServiceCache: jest.fn(),
  getContractCache: jest.fn(),
  setContractCache: jest.fn(),
  getListCache: jest.fn(),
  setListCache: jest.fn(),
  getStatsCache: jest.fn(),
  setStatsCache: jest.fn(),
  invalidateUserCache: jest.fn(),
  disconnect: jest.fn(),
};

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;

  beforeAll(async () => {
    const module = await createTestingModule(
      [
        AuthService,
        AuthController,
        UsersService,
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
      [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_DATABASE || 'skilllink_test',
          entities: [User, Profile],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([User, Profile]),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ]
    );

    app = await createTestApp(module);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration', () => {
    it('should register a new freelancer', async () => {
      const userData = {
        email: 'freelancer@test.com',
        password: 'password123',
        name: 'Test Freelancer',
        type: 'freelancer' as const,
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.type).toBe('freelancer');
    });

    it('should register a new company', async () => {
      const userData = {
        email: 'company@test.com',
        password: 'password123',
        name: 'Test Company',
        type: 'company' as const,
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.type).toBe('company');
    });

    it('should not register user with existing email', async () => {
      const userData = {
        email: 'existing@test.com',
        password: 'password123',
        name: 'Test User',
        type: 'freelancer' as const,
      };

      // First registration
      await authService.register(userData);

      // Second registration with same email should fail
      await expect(authService.register(userData)).rejects.toThrow();
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        email: 'login@test.com',
        password: 'password123',
        name: 'Login Test User',
        type: 'freelancer' as const,
      };
      await authService.register(userData);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe(loginData.email);
    });

    it('should not login with invalid password', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow();
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123',
      };

      await expect(authService.login(loginData)).rejects.toThrow();
    });
  });

  describe('Password Validation', () => {
    it('should validate password strength', async () => {
      const weakPasswordData = {
        email: 'weak@test.com',
        password: '123', // Too short
        name: 'Weak Password User',
        type: 'freelancer' as const,
      };

      await expect(authService.register(weakPasswordData)).rejects.toThrow();
    });
  });

  describe('JWT Token', () => {
    it('should generate valid JWT token', async () => {
      const userData = {
        email: 'jwt@test.com',
        password: 'password123',
        name: 'JWT Test User',
        type: 'freelancer' as const,
      };

      const result = await authService.register(userData);
      const token = result.access_token;

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });
});