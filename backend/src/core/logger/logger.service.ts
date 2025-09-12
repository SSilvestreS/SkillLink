import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint(),
      ),
      defaultMeta: { service: 'skilllink-api' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        // File transports
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Separate file for audit logs
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'audit.log'),
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Métodos específicos para auditoria
  audit(action: string, userId?: string, details?: any) {
    this.logger.info('AUDIT', {
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Métodos para métricas de performance
  performance(operation: string, duration: number, context?: string) {
    this.logger.info('PERFORMANCE', {
      operation,
      duration,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Métodos para logs de segurança
  security(event: string, userId?: string, ip?: string, details?: any) {
    this.logger.warn('SECURITY', {
      event,
      userId,
      ip,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
