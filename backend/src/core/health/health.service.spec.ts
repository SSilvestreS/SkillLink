import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';
import { CacheService } from '../cache/cache.service';

describe('HealthService', () => {
  let service: HealthService;
  let mockConfigService: Partial<ConfigService>;
  let mockCacheService: Partial<CacheService>;
  let mockDataSource: Partial<DataSource>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config = {
          APP_VERSION: '1.0.0',
          NODE_ENV: 'test',
        };
        return config[key] || defaultValue;
      }),
    };

    mockCacheService = {
      set: jest.fn(),
      get: jest.fn(),
    };

    mockDataSource = {
      query: jest.fn(),
      options: {
        type: 'postgres',
      } as any,
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
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return healthy status when all checks pass', async () => {
      // Mock successful database check
      (mockDataSource.query as jest.Mock).mockResolvedValue([{ result: 1 }]);
      
      // Mock successful cache check
      (mockCacheService.set as jest.Mock).mockResolvedValue(true);
      (mockCacheService.get as jest.Mock).mockResolvedValue('ok');

      const result = await service.getHealth();

      expect(result.status).toBe('healthy');
      expect(result.checks.database.status).toBe('ok');
      expect(result.checks.redis.status).toBe('ok');
      expect(result.checks.memory.status).toBe('ok');
      expect(result.checks.disk.status).toBe('ok');
    });

    it('should return degraded status when cache fails', async () => {
      // Mock successful database check
      (mockDataSource.query as jest.Mock).mockResolvedValue([{ result: 1 }]);
      
      // Mock failed cache check
      (mockCacheService.set as jest.Mock).mockResolvedValue(false);
      (mockCacheService.get as jest.Mock).mockResolvedValue(null);

      const result = await service.getHealth();

      expect(result.status).toBe('degraded');
      expect(result.checks.database.status).toBe('ok');
      expect(result.checks.redis.status).toBe('warning');
    });

    it('should return unhealthy status when database fails', async () => {
      // Mock failed database check
      (mockDataSource.query as jest.Mock).mockRejectedValue(new Error('Database connection failed'));
      
      // Mock successful cache check
      (mockCacheService.set as jest.Mock).mockResolvedValue(true);
      (mockCacheService.get as jest.Mock).mockResolvedValue('ok');

      const result = await service.getHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.checks.database.status).toBe('error');
    });
  });

  describe('getMetrics', () => {
    it('should return system metrics', async () => {
      const result = await service.getMetrics();

      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('cpu');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');
      expect(result.memory).toHaveProperty('used');
      expect(result.memory).toHaveProperty('total');
      expect(typeof result.uptime).toBe('number');
    });
  });
});