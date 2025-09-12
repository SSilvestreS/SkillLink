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
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const userId = (request as any).user?.id;

    const startTime = Date.now();

    // Log da requisição
    this.loggerService.log(
      `Incoming Request: ${method} ${url}`,
      'HTTP',
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const { statusCode } = response;

        // Log da resposta
        this.loggerService.log(
          `Outgoing Response: ${method} ${url} ${statusCode} - ${duration}ms`,
          'HTTP',
        );

        // Log de performance se demorar mais que 1 segundo
        if (duration > 1000) {
          this.loggerService.performance(
            `${method} ${url}`,
            duration,
            'HTTP',
          );
        }

        // Log de auditoria para operações importantes
        if (this.shouldAudit(method, url)) {
          this.loggerService.audit(
            `${method} ${url}`,
            userId,
            {
              ip,
              userAgent,
              statusCode,
              duration,
            },
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Log de erro
        this.loggerService.error(
          `Request Error: ${method} ${url} ${statusCode} - ${duration}ms`,
          error.stack,
          'HTTP',
        );

        // Log de segurança para erros de autenticação/autorização
        if (statusCode === 401 || statusCode === 403) {
          this.loggerService.security(
            `Authentication/Authorization Error: ${method} ${url}`,
            userId,
            ip,
            {
              userAgent,
              statusCode,
              error: error.message,
            },
          );
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
