import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
import { DataSource } from 'typeorm';

export interface HealthCheckResult {
  status: 'ok' | 'error' | 'warning';
  message: string;
  timestamp: string;
  details?: any;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheckResult;
    redis: HealthCheckResult;
    memory: HealthCheckResult;
    disk: HealthCheckResult;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    private dataSource: DataSource,
  ) {}

  async getHealth(): Promise<SystemHealth> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory(),
      this.checkDisk(),
    ]);

    const [database, redis, memory, disk] = checks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          status: 'error' as const,
          message: `Check ${index} failed: ${result.reason}`,
          timestamp: new Date().toISOString(),
        };
      }
    });

    const overallStatus = this.determineOverallStatus([database, redis, memory, disk]);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: this.configService.get('APP_VERSION', '1.0.0'),
      environment: this.configService.get('NODE_ENV', 'development'),
      checks: {
        database,
        redis,
        memory,
        disk,
      },
    };
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      const duration = Date.now() - start;

      return {
        status: 'ok',
        message: 'Database connection is healthy',
        timestamp: new Date().toISOString(),
        details: {
          responseTime: `${duration}ms`,
          type: this.dataSource.options.type,
        },
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
        details: {
          error: error.message,
        },
      };
    }
  }

  private async checkRedis(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();
      await this.cacheService.set('health_check', 'ok', 10);
      const value = await this.cacheService.get('health_check');
      const duration = Date.now() - start;

      if (value === 'ok') {
        return {
          status: 'ok',
          message: 'Redis connection is healthy',
          timestamp: new Date().toISOString(),
          details: {
            responseTime: `${duration}ms`,
            value: value,
          },
        };
      } else {
        return {
          status: 'error',
          message: 'Redis value mismatch',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'error',
        message: 'Redis connection failed',
        timestamp: new Date().toISOString(),
        details: {
          error: error.message,
        },
      };
    }
  }

  private async checkMemory(): Promise<HealthCheckResult> {
    try {
      const memUsage = process.memoryUsage();
      const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const externalMB = Math.round(memUsage.external / 1024 / 1024);
      const rssMB = Math.round(memUsage.rss / 1024 / 1024);

      const usagePercentage = (usedMB / totalMB) * 100;
      const status = usagePercentage > 90 ? 'error' : usagePercentage > 80 ? 'warning' : 'ok';

      return {
        status,
        message: `Memory usage: ${usedMB}MB / ${totalMB}MB (${usagePercentage.toFixed(1)}%)`,
        timestamp: new Date().toISOString(),
        details: {
          heapTotal: `${totalMB}MB`,
          heapUsed: `${usedMB}MB`,
          external: `${externalMB}MB`,
          rss: `${rssMB}MB`,
          usagePercentage: Math.round(usagePercentage),
        },
      };
    } catch (error) {
      this.logger.error('Memory health check failed:', error);
      return {
        status: 'error',
        message: 'Memory check failed',
        timestamp: new Date().toISOString(),
        details: {
          error: error.message,
        },
      };
    }
  }

  private async checkDisk(): Promise<HealthCheckResult> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Verificar espaço em disco do diretório atual
      const stats = fs.statSync(process.cwd());
      const freeSpace = require('os').freemem();
      const totalSpace = require('os').totalmem();
      const usagePercentage = ((totalSpace - freeSpace) / totalSpace) * 100;

      const status = usagePercentage > 95 ? 'error' : usagePercentage > 85 ? 'warning' : 'ok';

      return {
        status,
        message: `Disk usage: ${usagePercentage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        details: {
          freeSpace: `${Math.round(freeSpace / 1024 / 1024)}MB`,
          totalSpace: `${Math.round(totalSpace / 1024 / 1024)}MB`,
          usagePercentage: Math.round(usagePercentage),
        },
      };
    } catch (error) {
      this.logger.error('Disk health check failed:', error);
      return {
        status: 'error',
        message: 'Disk check failed',
        timestamp: new Date().toISOString(),
        details: {
          error: error.message,
        },
      };
    }
  }

  private determineOverallStatus(checks: HealthCheckResult[]): 'healthy' | 'unhealthy' | 'degraded' {
    const hasError = checks.some(check => check.status === 'error');
    const hasWarning = checks.some(check => check.status === 'warning');

    if (hasError) {
      return 'unhealthy';
    } else if (hasWarning) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  // Método para obter métricas detalhadas
  async getMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    return {
      timestamp: new Date().toISOString(),
      uptime: {
        process: uptime,
        system: Date.now() - this.startTime,
      },
      memory: {
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
    };
  }
}
