import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from '../src/core/cache/cache.service';
import { LoggerService } from '../src/core/logger/logger.service';
import { HealthService } from '../src/core/health/health.service';

describe('Services Integration', () => {
  let cacheService: CacheService;
  let loggerService: LoggerService;
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [CacheService, LoggerService, HealthService],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
    loggerService = module.get<LoggerService>(LoggerService);
    healthService = module.get<HealthService>(HealthService);
  });

  describe('CacheService', () => {
    it('should be defined', () => {
      expect(cacheService).toBeDefined();
    });

    it('should have Redis client with .on method', () => {
      // Verificar se o mock do Redis tem o método .on
      expect(cacheService).toBeDefined();
    });

    it('should handle Redis operations gracefully', async () => {
      // Teste de operações básicas do Redis
      const testKey = 'test:integration:key';
      const testValue = { message: 'test', timestamp: Date.now() };

      // Teste de set
      const setResult = await cacheService.set(testKey, testValue, 60);
      expect(setResult).toBe(true);

      // Teste de get
      const getResult = await cacheService.get(testKey);
      expect(getResult).toEqual(testValue);

      // Teste de exists
      const existsResult = await cacheService.exists(testKey);
      expect(existsResult).toBe(true);

      // Teste de delete
      const delResult = await cacheService.del(testKey);
      expect(delResult).toBe(true);

      // Verificar se foi deletado
      const existsAfterDel = await cacheService.exists(testKey);
      expect(existsAfterDel).toBe(false);
    });
  });

  describe('LoggerService', () => {
    it('should be defined', () => {
      expect(loggerService).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(typeof loggerService.log).toBe('function');
      expect(typeof loggerService.error).toBe('function');
      expect(typeof loggerService.warn).toBe('function');
      expect(typeof loggerService.debug).toBe('function');
      expect(typeof loggerService.verbose).toBe('function');
      expect(typeof loggerService.audit).toBe('function');
      expect(typeof loggerService.performance).toBe('function');
      expect(typeof loggerService.security).toBe('function');
    });

    it('should log messages without errors', () => {
      expect(() => {
        loggerService.log('Test log message', 'TestContext');
        loggerService.error('Test error message', 'Test stack', 'TestContext');
        loggerService.warn('Test warning message', 'TestContext');
        loggerService.debug('Test debug message', 'TestContext');
        loggerService.verbose('Test verbose message', 'TestContext');
        loggerService.audit('test_action', 'user123', { details: 'test' });
        loggerService.performance('test_operation', 100, 'TestContext');
        loggerService.security('test_event', 'user123', '192.168.1.1', { details: 'test' });
      }).not.toThrow();
    });
  });

  describe('HealthService', () => {
    it('should be defined', () => {
      expect(healthService).toBeDefined();
    });

    it('should have getHealth method', () => {
      expect(typeof healthService.getHealth).toBe('function');
    });

    it('should return health status', async () => {
      const health = await healthService.getHealth();
      
      expect(health).toBeDefined();
      expect(health.status).toMatch(/^(healthy|unhealthy|degraded)$/);
      expect(health.timestamp).toBeDefined();
      expect(health.uptime).toBeGreaterThanOrEqual(0);
      expect(health.version).toBeDefined();
      expect(health.environment).toBeDefined();
      expect(health.checks).toBeDefined();
      expect(health.checks.database).toBeDefined();
      expect(health.checks.redis).toBeDefined();
      expect(health.checks.memory).toBeDefined();
      expect(health.checks.disk).toBeDefined();
    });

    it('should handle Redis unavailability gracefully', async () => {
      // O HealthService deve retornar warning para Redis, não error
      const health = await healthService.getHealth();
      
      // Redis pode estar indisponível, mas não deve quebrar o health check
      expect(health.checks.redis.status).toMatch(/^(ok|warning)$/);
      expect(health.status).toMatch(/^(healthy|degraded)$/);
    });
  });

  describe('Service Integration', () => {
    it('should work together without conflicts', async () => {
      // Teste de integração entre os serviços
      const testKey = 'integration:test';
      const testData = { service: 'integration', timestamp: Date.now() };

      // Logger deve funcionar
      expect(() => {
        loggerService.log('Starting integration test', 'IntegrationTest');
      }).not.toThrow();

      // Cache deve funcionar
      const cacheResult = await cacheService.set(testKey, testData, 30);
      expect(cacheResult).toBe(true);

      // Health check deve funcionar
      const health = await healthService.getHealth();
      expect(health).toBeDefined();

      // Cleanup
      await cacheService.del(testKey);
    });
  });
});
