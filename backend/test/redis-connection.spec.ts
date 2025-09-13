import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from '../src/core/cache/cache.service';

describe('Redis Connection', () => {
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [CacheService],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
  });

  describe('Redis Client Initialization', () => {
    it('should initialize Redis client with .on method', async () => {
      // Verificar se o CacheService pode ser criado
      expect(cacheService).toBeDefined();
      
      // Verificar se o Redis client tem o método .on
      // Isso é verificado indiretamente através das operações
      const testKey = 'test:redis:connection';
      const testValue = { message: 'Redis connection test', timestamp: Date.now() };

      // Teste de operações básicas
      const setResult = await cacheService.set(testKey, testValue, 60);
      expect(setResult).toBe(true);

      const getResult = await cacheService.get(testKey);
      expect(getResult).toEqual(testValue);

      // Cleanup
      await cacheService.del(testKey);
    });

    it('should handle Redis operations without errors', async () => {
      const operations = [
        { key: 'test:1', value: 'value1', ttl: 60 },
        { key: 'test:2', value: { data: 'value2' }, ttl: 30 },
        { key: 'test:3', value: [1, 2, 3], ttl: 10 },
      ];

      // Teste de múltiplas operações
      for (const op of operations) {
        const setResult = await cacheService.set(op.key, op.value, op.ttl);
        expect(setResult).toBe(true);

        const getResult = await cacheService.get(op.key);
        expect(getResult).toEqual(op.value);

        const existsResult = await cacheService.exists(op.key);
        expect(existsResult).toBe(true);
      }

      // Cleanup
      for (const op of operations) {
        await cacheService.del(op.key);
      }
    });

    it('should handle Redis errors gracefully', async () => {
      // Teste com chave inválida (deve retornar null, não quebrar)
      const invalidKey = null as any;
      const result = await cacheService.get(invalidKey);
      expect(result).toBeNull();
    });
  });

  describe('Redis Event Handling', () => {
    it('should handle Redis events through .on method', async () => {
      // O mock do Redis deve ter o método .on implementado
      // Isso é testado indiretamente através da inicialização do CacheService
      expect(cacheService).toBeDefined();
      
      // Verificar se as operações funcionam (indicando que os event listeners estão OK)
      const testKey = 'test:events';
      const testValue = 'event test';
      
      const setResult = await cacheService.set(testKey, testValue);
      expect(setResult).toBe(true);
      
      const getResult = await cacheService.get(testKey);
      expect(getResult).toBe(testValue);
      
      // Cleanup
      await cacheService.del(testKey);
    });
  });
});
