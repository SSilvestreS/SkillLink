import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

export interface RateLimitConfig {
  windowMs: number; // Janela de tempo em ms
  maxRequests: number; // Máximo de requests
  keyGenerator?: (req: any) => string; // Função para gerar chave única
  skipSuccessfulRequests?: boolean; // Pular requests bem-sucedidos
  skipFailedRequests?: boolean; // Pular requests com falha
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(private cacheService: CacheService) {}

  async checkRateLimit(
    key: string,
    config: RateLimitConfig,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const cacheKey = `rate_limit:${key}`;

    try {
      // Buscar requests existentes
      const requests = await this.cacheService.get<number[]>(cacheKey) || [];
      
      // Se não conseguiu buscar do cache, usar array vazio
      const validRequests = Array.isArray(requests) 
        ? requests.filter(timestamp => timestamp > windowStart)
        : [];
      
      // Verificar se excedeu o limite
      if (validRequests.length >= config.maxRequests) {
        const oldestRequest = Math.min(...validRequests);
        const resetTime = oldestRequest + config.windowMs;
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
        };
      }

      // Adicionar novo request
      validRequests.push(now);
      
      // Tentar salvar no cache, mas não falhar se não conseguir
      const ttl = Math.ceil(config.windowMs / 1000);
      const saved = await this.cacheService.set(cacheKey, validRequests, ttl);
      
      if (!saved) {
        this.logger.warn(`Failed to save rate limit data for key ${key}, using in-memory fallback`);
      }

      return {
        allowed: true,
        remaining: config.maxRequests - validRequests.length - 1,
        resetTime: now + config.windowMs,
      };
    } catch (error) {
      this.logger.error(`Error checking rate limit for key ${key}:`, error);
      // Em caso de erro, permitir o request (fail-open)
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
      };
    }
  }

  // Rate limit por IP
  async checkIpRateLimit(ip: string, config: RateLimitConfig) {
    return this.checkRateLimit(`ip:${ip}`, config);
  }

  // Rate limit por usuário
  async checkUserRateLimit(userId: string, config: RateLimitConfig) {
    return this.checkRateLimit(`user:${userId}`, config);
  }

  // Rate limit por endpoint
  async checkEndpointRateLimit(ip: string, endpoint: string, config: RateLimitConfig) {
    return this.checkRateLimit(`endpoint:${ip}:${endpoint}`, config);
  }

  // Rate limit para login
  async checkLoginRateLimit(ip: string, email?: string) {
    const key = email ? `login:${ip}:${email}` : `login:${ip}`;
    return this.checkRateLimit(key, {
      windowMs: 15 * 60 * 1000, // 15 minutos
      maxRequests: 5, // 5 tentativas
    });
  }

  // Rate limit para registro
  async checkRegisterRateLimit(ip: string) {
    return this.checkRateLimit(`register:${ip}`, {
      windowMs: 60 * 60 * 1000, // 1 hora
      maxRequests: 3, // 3 registros por hora
    });
  }

  // Rate limit para API geral
  async checkApiRateLimit(ip: string, userId?: string) {
    const key = userId ? `api:${userId}` : `api:${ip}`;
    return this.checkRateLimit(key, {
      windowMs: 15 * 60 * 1000, // 15 minutos
      maxRequests: userId ? 1000 : 100, // 1000 para usuários autenticados, 100 para anônimos
    });
  }

  // Rate limit para upload de arquivos
  async checkUploadRateLimit(ip: string, userId?: string) {
    const key = userId ? `upload:${userId}` : `upload:${ip}`;
    return this.checkRateLimit(key, {
      windowMs: 60 * 60 * 1000, // 1 hora
      maxRequests: userId ? 50 : 10, // 50 uploads para usuários autenticados, 10 para anônimos
    });
  }

  // Rate limit para pagamentos
  async checkPaymentRateLimit(userId: string) {
    return this.checkRateLimit(`payment:${userId}`, {
      windowMs: 60 * 60 * 1000, // 1 hora
      maxRequests: 20, // 20 pagamentos por hora
    });
  }

  // Limpar rate limit (para testes ou admin)
  async clearRateLimit(key: string): Promise<boolean> {
    return this.cacheService.del(`rate_limit:${key}`);
  }

  // Obter estatísticas de rate limit
  async getRateLimitStats(key: string) {
    const cacheKey = `rate_limit:${key}`;
    const requests = await this.cacheService.get<number[]>(cacheKey) || [];
    const now = Date.now();
    
    return {
      totalRequests: requests.length,
      requestsLastHour: requests.filter(t => now - t < 60 * 60 * 1000).length,
      requestsLastDay: requests.filter(t => now - t < 24 * 60 * 60 * 1000).length,
      oldestRequest: requests.length > 0 ? Math.min(...requests) : null,
      newestRequest: requests.length > 0 ? Math.max(...requests) : null,
    };
  }
}
