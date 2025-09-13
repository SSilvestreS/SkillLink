import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service';
import { CacheService } from '../cache/cache.service';

// Mock CacheService
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkRateLimit', () => {
    it('should allow request when under limit', async () => {
      // const now = Date.now(); // Removido - não utilizado
      const config = {
        windowMs: 60000, // 1 minute
        maxRequests: 10,
      };

      // Mock empty cache (no previous requests)
      mockCacheService.get.mockResolvedValue([]);
      mockCacheService.set.mockResolvedValue(true);

      const result = await service.checkRateLimit('test-key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9); // 10 - 1 (1 request adicionado)
      expect(mockCacheService.get).toHaveBeenCalledWith('rate_limit:test-key');
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should deny request when over limit', async () => {
      // const now = Date.now(); // Removido - não utilizado
      const config = {
        windowMs: 60000, // 1 minute
        maxRequests: 2,
      };

      // Mock cache with existing requests
      const currentTime = Date.now();
      const existingRequests = [currentTime - 30000, currentTime - 20000, currentTime - 10000]; // 3 requests
      mockCacheService.get.mockResolvedValue(existingRequests);

      const result = await service.checkRateLimit('test-key', config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should filter out old requests', async () => {
      const currentTime = Date.now();
      const config = {
        windowMs: 60000, // 1 minute
        maxRequests: 5,
      };

      // Mock cache with old and new requests
      const existingRequests = [
        currentTime - 70000, // Old request (outside window)
        currentTime - 30000, // Recent request
        currentTime - 20000, // Recent request
      ];
      mockCacheService.get.mockResolvedValue(existingRequests);
      mockCacheService.set.mockResolvedValue(true);

      const result = await service.checkRateLimit('test-key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // 5 - 3 (2 recent + 1 new = 3 total)
    });

    it('should handle cache errors gracefully', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 10,
      };

      // Mock cache error
      mockCacheService.get.mockRejectedValue(new Error('Cache error'));

      const result = await service.checkRateLimit('test-key', config);

      expect(result.allowed).toBe(true); // Fail-open
      expect(result.remaining).toBe(10);
    });

    it('should handle invalid cache data', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 10,
      };

      // Mock invalid cache data
      mockCacheService.get.mockResolvedValue('invalid-data');
      mockCacheService.set.mockResolvedValue(true);

      const result = await service.checkRateLimit('test-key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9); // 10 - 1 (1 request adicionado)
    });
  });

  describe('checkLoginRateLimit', () => {
    it('should check login rate limit', async () => {
      const ip = '192.168.1.1';
      const email = 'test@example.com';

      mockCacheService.get.mockResolvedValue([]);
      mockCacheService.set.mockResolvedValue(true);

      const result = await service.checkLoginRateLimit(ip, email);

      expect(result.allowed).toBe(true);
      expect(mockCacheService.get).toHaveBeenCalledWith('rate_limit:login:192.168.1.1:test@example.com');
    });
  });

  describe('checkApiRateLimit', () => {
    it('should check API rate limit for IP', async () => {
      const ip = '192.168.1.1';

      mockCacheService.get.mockResolvedValue([]);
      mockCacheService.set.mockResolvedValue(true);

      const result = await service.checkApiRateLimit(ip);

      expect(result.allowed).toBe(true);
      expect(mockCacheService.get).toHaveBeenCalledWith('rate_limit:api:192.168.1.1');
    });

    it('should check API rate limit for user', async () => {
      const ip = '192.168.1.1';
      const userId = 'user123';

      mockCacheService.get.mockResolvedValue([]);
      mockCacheService.set.mockResolvedValue(true);

      const result = await service.checkApiRateLimit(ip, userId);

      expect(result.allowed).toBe(true);
      expect(mockCacheService.get).toHaveBeenCalledWith('rate_limit:api:user123');
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit for key', async () => {
      const key = 'test-key';
      mockCacheService.del.mockResolvedValue(true);

      const result = await service.clearRateLimit(key);

      expect(result).toBe(true);
      expect(mockCacheService.del).toHaveBeenCalledWith('rate_limit:test-key');
    });
  });

  describe('getRateLimitStats', () => {
    it('should return rate limit statistics', async () => {
      // const now = Date.now(); // Removido - não utilizado
      const currentTime = Date.now();
      const requests = [currentTime - 30000, currentTime - 20000, currentTime - 10000];
      mockCacheService.get.mockResolvedValue(requests);

      const stats = await service.getRateLimitStats('test-key');
      expect(stats.totalRequests).toBe(3);
      expect(stats.requestsLastHour).toBe(3);
      expect(stats.requestsLastDay).toBe(3);
      expect(stats.oldestRequest).toBe(currentTime - 30000);
      expect(stats.newestRequest).toBe(currentTime - 10000);
    });
  });
});
