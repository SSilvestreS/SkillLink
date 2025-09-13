import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    // const userAgent = request.get('User-Agent') || ''; // Removido - não utilizado
    const userId = (request as any).user?.id;

    const startTime = Date.now();

    // Log da requisição
    this.logger.log(`Incoming Request: ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const { statusCode } = response;

        // Log da resposta
        this.logger.log(`Outgoing Response: ${method} ${url} ${statusCode} - ${duration}ms`);

        // Log de performance se demorar mais que 1 segundo
        if (duration > 1000) {
          this.logger.warn(`Slow request: ${method} ${url} - ${duration}ms`);
        }

        // Log de auditoria para operações importantes
        if (this.shouldAudit(method, url)) {
          this.logger.log(`Audit: ${method} ${url} - User: ${userId} - IP: ${ip}`);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Log de erro
        this.logger.error(`Request Error: ${method} ${url} ${statusCode} - ${duration}ms`, error.stack);

        // Log de segurança para erros de autenticação/autorização
        if (statusCode === 401 || statusCode === 403) {
          this.logger.warn(`Security: Auth error ${method} ${url} - User: ${userId} - IP: ${ip}`);
        }

        throw error;
      }),
    );
  }

  private shouldAudit(method: string, url: string): boolean {
    // Auditar operações importantes
    const auditPatterns = [
      /\/auth\/(login|register|logout)/,
      /\/users\/\d+/,
      /\/contracts\/\d+/,
      /\/payments/,
      /\/admin/,
    ];

    return auditPatterns.some(pattern => pattern.test(url)) || method !== 'GET';
  }
}
