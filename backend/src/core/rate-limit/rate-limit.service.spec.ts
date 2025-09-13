import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service';
import { CacheService } from '../cache/cache.service';

describe('RateLimitService', () => {
  let service: RateLimitService;
  let mockCacheService: Partial<CacheService>;

  beforeEach(async () => {
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkRateLimit', () => {
    it('should allow request when under limit', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 10,
      };

      (mockCacheService.get as jest.Mock).mockResolvedValue([]);
      (mockCacheService.set as jest.Mock).mockResolvedValue(true);

      const result = await service.checkRateLimit('test-key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should deny request when over limit', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 2,
      };

      const currentTime = Date.now();
      const existingRequests = [currentTime - 30000, currentTime - 20000, currentTime - 10000];
      (mockCacheService.get as jest.Mock).mockResolvedValue(existingRequests);

      const result = await service.checkRateLimit('test-key', config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should filter out old requests', async () => {
      const currentTime = Date.now();
      const config = {
        windowMs: 60000,
        maxRequests: 5,
      };

      const existingRequests = [
        currentTime - 70000, // Old request (outside window)
        currentTime - 30000, // Recent request
        currentTime - 20000, // Recent request
      ];
      (mockCacheService.get as jest.Mock).mockResolvedValue(existingRequests);
      (mockCacheService.set as jest.Mock).mockResolvedValue(true);

      const result = await service.checkRateLimit('test-key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should handle cache errors gracefully', async () => {
      const config = {
        windowMs: 60000,
        maxRequests: 10,
      };

      (mockCacheService.get as jest.Mock).mockRejectedValue(new Error('Cache error'));

      const result = await service.checkRateLimit('test-key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(10);
    });
  });

  describe('checkLoginRateLimit', () => {
    it('should check login rate limit', async () => {
      const ip = '192.168.1.1';
      const email = 'test@example.com';

      (mockCacheService.get as jest.Mock).mockResolvedValue([]);
      (mockCacheService.set as jest.Mock).mockResolvedValue(true);

      const result = await service.checkLoginRateLimit(ip, email);

      expect(result.allowed).toBe(true);
    });
  });

  describe('checkApiRateLimit', () => {
    it('should check API rate limit for IP', async () => {
      const ip = '192.168.1.1';

      (mockCacheService.get as jest.Mock).mockResolvedValue([]);
      (mockCacheService.set as jest.Mock).mockResolvedValue(true);

      const result = await service.checkApiRateLimit(ip);

      expect(result.allowed).toBe(true);
    });

    it('should check API rate limit for user', async () => {
      const userId = 'user123';

      (mockCacheService.get as jest.Mock).mockResolvedValue([]);
      (mockCacheService.set as jest.Mock).mockResolvedValue(true);

      const result = await service.checkApiRateLimit(userId);

      expect(result.allowed).toBe(true);
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit for key', async () => {
      (mockCacheService.del as jest.Mock).mockResolvedValue(true);

      const result = await service.clearRateLimit('test-key');

      expect(result).toBe(true);
    });
  });

  describe('getRateLimitStats', () => {
    it('should return rate limit statistics', async () => {
      (mockCacheService.get as jest.Mock).mockResolvedValue([]);

      const result = await service.getRateLimitStats('test-key');

      expect(result).toHaveProperty('totalRequests');
      expect(result).toHaveProperty('remainingRequests');
      expect(result).toHaveProperty('resetTime');
    });
  });
});