import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { Request } from 'express';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private rateLimitService: RateLimitService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);
    const userId = (request as any).user?.id;

    // Configuração de rate limit baseada no endpoint
    const endpoint = request.route?.path || request.path;
    const method = request.method;

    let rateLimitResult;

    // Rate limit específico por endpoint
    if (endpoint.includes('/auth/login')) {
      rateLimitResult = await this.rateLimitService.checkLoginRateLimit(ip, request.body?.email);
    } else if (endpoint.includes('/auth/register')) {
      rateLimitResult = await this.rateLimitService.checkRegisterRateLimit(ip);
    } else if (endpoint.includes('/upload')) {
      rateLimitResult = await this.rateLimitService.checkUploadRateLimit(ip, userId);
    } else if (endpoint.includes('/payments')) {
      rateLimitResult = await this.rateLimitService.checkPaymentRateLimit(userId);
    } else {
      // Rate limit geral da API
      rateLimitResult = await this.rateLimitService.checkApiRateLimit(ip, userId);
    }

    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime);
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);

      throw new HttpException(
        {
          message: 'Rate limit exceeded',
          error: 'Too Many Requests',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          retryAfter,
          resetTime: resetTime.toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Adicionar headers de rate limit na resposta
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', '1000');
    response.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
    response.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

    return next.handle();
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}
