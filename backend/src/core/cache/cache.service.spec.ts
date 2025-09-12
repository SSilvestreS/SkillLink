import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    flushall: jest.fn(),
    keys: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn(),
  }));
});

describe('CacheService', () => {
  let service: CacheService;
  let mockRedis: any;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config = {
          REDIS_HOST: 'localhost',
          REDIS_PORT: 6379,
          REDIS_PASSWORD: undefined,
        };
        return config[key] || defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    mockRedis = (service as any).redis;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return parsed value when key exists', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await service.get('test-key');
      expect(result).toEqual(testData);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.get('test-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.set('test-key', testData);
      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    it('should set value with TTL', async () => {
      const testData = { id: 1, name: 'Test' };
      const ttl = 3600;
      mockRedis.setex.mockResolvedValue('OK');

      const result = await service.set('test-key', testData, ttl);
      expect(result).toBe(true);
      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', ttl, JSON.stringify(testData));
    });

    it('should return false on error', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'));

      const result = await service.set('test-key', 'test-value');
      expect(result).toBe(false);
    });
  });

  describe('del', () => {
    it('should delete key successfully', async () => {
      mockRedis.del.mockResolvedValue(1);

      const result = await service.del('test-key');
      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });

    it('should return false on error', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      const result = await service.del('test-key');
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await service.exists('test-key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await service.exists('test-key');
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockRedis.exists.mockRejectedValue(new Error('Redis error'));

      const result = await service.exists('test-key');
      expect(result).toBe(false);
    });
  });

  describe('flush', () => {
    it('should flush all keys successfully', async () => {
      mockRedis.flushall.mockResolvedValue('OK');

      const result = await service.flush();
      expect(result).toBe(true);
      expect(mockRedis.flushall).toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      mockRedis.flushall.mockRejectedValue(new Error('Redis error'));

      const result = await service.flush();
      expect(result).toBe(false);
    });
  });

  describe('keys', () => {
    it('should return matching keys', async () => {
      const mockKeys = ['key1', 'key2', 'key3'];
      mockRedis.keys.mockResolvedValue(mockKeys);

      const result = await service.keys('test:*');
      expect(result).toEqual(mockKeys);
      expect(mockRedis.keys).toHaveBeenCalledWith('test:*');
    });

    it('should return empty array on error', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Redis error'));

      const result = await service.keys('test:*');
      expect(result).toEqual([]);
    });
  });
});
