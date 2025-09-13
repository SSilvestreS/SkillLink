import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// // import { TypeOrmModule } from '@nestjs/typeorm'; // Removido - não utilizado // Removido - não utilizado

// Mock do Redis para testes
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    flushall: jest.fn().mockResolvedValue('OK'),
    keys: jest.fn().mockResolvedValue([]),
    ping: jest.fn().mockResolvedValue('PONG'),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    once: jest.fn(),
    connected: true,
    status: 'ready',
  }));
});

// Mock do LoggerService
jest.mock('../src/core/logger/logger.service', () => ({
  LoggerService: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    performance: jest.fn(),
    audit: jest.fn(),
    security: jest.fn(),
  })),
}));

// Configuração global para testes
beforeAll(async () => {
  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_USERNAME = 'postgres';
  process.env.DB_PASSWORD = 'postgres';
  process.env.DB_DATABASE = 'skilllink_test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  process.env.REDIS_PASSWORD = '';
});

afterAll(async () => {
  // Cleanup global
  jest.clearAllMocks();
  
  // Aguardar um pouco para garantir que todas as conexões sejam fechadas
  await new Promise(resolve => setTimeout(resolve, 1000));
});

// Helper para criar módulo de teste
export const createTestingModule = async (providers: any[] = [], imports: any[] = []) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      ...imports,
    ],
    providers: [
      ...providers,
    ],
  }).compile();

  return module;
};

// Helper para criar aplicação de teste
export const createTestApp = async (module: TestingModule): Promise<INestApplication> => {
  const app = module.createNestApplication();
  await app.init();
  return app;
};
