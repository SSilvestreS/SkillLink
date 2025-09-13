import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { HealthService } from './health.service';
import { CacheService } from '../cache/cache.service';

// Mock DataSource
const mockDataSource = {
  query: jest.fn(),
  options: {
    type: 'postgres',
  },
};

// Mock CacheService
const mockCacheService = {
  set: jest.fn(),
  get: jest.fn(),
};

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config = {
          APP_VERSION: '1.0.0',
          NODE_ENV: 'test',
        };
        return config[key] || defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return healthy status when all checks pass', async () => {
      // Mock successful database check
      mockDataSource.query.mockResolvedValue([{ result: 1 }]);
      
      // Mock successful cache check
      mockCacheService.set.mockResolvedValue(true);
      mockCacheService.get.mockResolvedValue('ok');

      const result = await service.getHealth();

      expect(result.status).toBe('healthy');
      expect(result.checks.database.status).toBe('ok');
      expect(result.checks.redis.status).toBe('ok');
      expect(result.checks.memory.status).toBe('ok');
      expect(result.checks.disk.status).toBe('ok');
    });

    it('should return degraded status when cache fails', async () => {
      // Mock successful database check
      mockDataSource.query.mockResolvedValue([{ result: 1 }]);
      
      // Mock failed cache check
      mockCacheService.set.mockResolvedValue(false);

      const result = await service.getHealth();

      expect(result.status).toBe('degraded');
      expect(result.checks.database.status).toBe('ok');
      expect(result.checks.redis.status).toBe('warning');
    });

    it('should return unhealthy status when database fails', async () => {
      // Mock failed database check
      mockDataSource.query.mockRejectedValue(new Error('Database connection failed'));
      
      // Mock successful cache check
      mockCacheService.set.mockResolvedValue(true);
      mockCacheService.get.mockResolvedValue('ok');

      const result = await service.getHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.checks.database.status).toBe('error');
    });
  });

  describe('getMetrics', () => {
    it('should return system metrics', async () => {
      const metrics = await service.getMetrics();

      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('cpu');
      expect(metrics).toHaveProperty('environment');
      expect(metrics.memory).toHaveProperty('heapTotal');
      expect(metrics.memory).toHaveProperty('heapUsed');
      expect(metrics.cpu).toHaveProperty('user');
      expect(metrics.cpu).toHaveProperty('system');
    });
  });
});
