import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config = {
          LOG_LEVEL: 'info',
          NODE_ENV: 'test',
        };
        return config[key] || defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log info message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    service.log('Test message', 'TestContext');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log error message', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    service.error('Test error', 'Test stack', 'TestContext');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log warning message', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    service.warn('Test warning', 'TestContext');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log debug message', () => {
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
    
    service.debug('Test debug', 'TestContext');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log verbose message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    service.verbose('Test verbose', 'TestContext');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log audit message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    service.audit('Test action', 'user123', { test: 'data' });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log performance message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    service.performance('Test operation', 1500, 'TestContext');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log security message', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    service.security('Test security event', 'user123', '192.168.1.1', {
      test: 'data',
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});