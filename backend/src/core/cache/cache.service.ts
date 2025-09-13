import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private redis: Redis;
  private readonly logger = new Logger(CacheService.name);
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  private async initializeRedis(): Promise<void> {
    if (this.redis && this.isConnected) {
      return;
    }

        this.redis = new Redis({
          host: this.configService.get('REDIS_HOST', 'localhost'),
          port: this.configService.get('REDIS_PORT', 6379),
          password: this.configService.get('REDIS_PASSWORD'),
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
          lazyConnect: true, // Conectar apenas quando necessário
        });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
      this.isConnected = true;
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
      this.isConnected = false;
    });

    // ioredis conecta automaticamente, não precisa chamar connect()
    // Apenas verificar se está conectado
    try {
      await this.redis.ping();
      this.isConnected = true;
    } catch (error) {
      this.logger.warn('Redis connection failed, will retry on next operation:', error.message);
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      await this.initializeRedis();
      if (!this.isConnected) {
        this.logger.warn(`Redis not connected, returning null for key: ${key}`);
        return null;
      }
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      await this.initializeRedis();
      if (!this.isConnected) {
        this.logger.warn(`Redis not connected, skipping set for key: ${key}`);
        return false;
      }
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.initializeRedis();
      if (!this.isConnected) {
        this.logger.warn(`Redis not connected, skipping delete for key: ${key}`);
        return false;
      }
      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.initializeRedis();
      if (!this.isConnected) {
        this.logger.warn(`Redis not connected, returning false for exists check: ${key}`);
        return false;
      }
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking cache key ${key}:`, error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      await this.initializeRedis();
      if (!this.isConnected) {
        this.logger.warn('Redis not connected, skipping flush');
        return false;
      }
      await this.redis.flushall();
      return true;
    } catch (error) {
      this.logger.error('Error flushing cache:', error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      await this.initializeRedis();
      if (!this.isConnected) {
        this.logger.warn(`Redis not connected, returning empty array for pattern: ${pattern}`);
        return [];
      }
      return await this.redis.keys(pattern);
    } catch (error) {
      this.logger.error(`Error getting keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  // Métodos específicos para diferentes tipos de dados
  async getUserCache(userId: string): Promise<any> {
    return this.get(`user:${userId}`);
  }

  async setUserCache(userId: string, userData: any, ttl = 3600): Promise<boolean> {
    return this.set(`user:${userId}`, userData, ttl);
  }

  async getServiceCache(serviceId: string): Promise<any> {
    return this.get(`service:${serviceId}`);
  }

  async setServiceCache(serviceId: string, serviceData: any, ttl = 1800): Promise<boolean> {
    return this.set(`service:${serviceId}`, serviceData, ttl);
  }

  async getContractCache(contractId: string): Promise<any> {
    return this.get(`contract:${contractId}`);
  }

  async setContractCache(contractId: string, contractData: any, ttl = 1800): Promise<boolean> {
    return this.set(`contract:${contractId}`, contractData, ttl);
  }

  // Métodos para cache de listas
  async getListCache(key: string): Promise<any[]> {
    const data = await this.get(key);
    return Array.isArray(data) ? data : [];
  }

  async setListCache(key: string, data: any[], ttl = 900): Promise<boolean> {
    return this.set(key, data, ttl);
  }

  // Métodos para cache de estatísticas
  async getStatsCache(type: string): Promise<any> {
    return this.get(`stats:${type}`);
  }

  async setStatsCache(type: string, data: any, ttl = 300): Promise<boolean> {
    return this.set(`stats:${type}`, data, ttl);
  }

  // Método para invalidar cache relacionado
  async invalidateUserCache(userId: string): Promise<void> {
    await this.initializeRedis();
    if (!this.isConnected) {
      this.logger.warn(`Redis not connected, skipping cache invalidation for user: ${userId}`);
      return;
    }
    
    const patterns = [
      `user:${userId}`,
      `user:${userId}:*`,
      `contract:*:user:${userId}`,
      `service:*:user:${userId}`,
    ];

    for (const pattern of patterns) {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
    }
  }
}
