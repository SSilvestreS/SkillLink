import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationGuard implements CanActivate {
  private readonly logger = new Logger(ValidationGuard.name);

  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { body, query, params } = request;

    // Validar body se existir
    if (body && Object.keys(body).length > 0) {
      await this.validateObject(body, 'body');
    }

    // Validar query parameters se existirem
    if (query && Object.keys(query).length > 0) {
      await this.validateObject(query, 'query');
    }

    // Validar params se existirem
    if (params && Object.keys(params).length > 0) {
      await this.validateObject(params, 'params');
    }

    return true;
  }

  private async validateObject(obj: any, type: string): Promise<void> {
    try {
      // Converter para classe de validação se especificada
      const validationClass = this.getValidationClass(obj, type);
      
      if (validationClass) {
        const dto = plainToClass(validationClass, obj);
        const errors = await validate(dto);

        if (errors.length > 0) {
          const errorMessages = this.formatValidationErrors(errors);
          this.logger.warn(`Validation failed for ${type}:`, errorMessages);
          
          throw new BadRequestException({
            message: 'Validation failed',
            errors: errorMessages,
            type,
          });
        }
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Validation error for ${type}:`, error);
      throw new BadRequestException(`Invalid ${type} data`);
    }
  }

  private getValidationClass(obj: any, type: string): any {
    // Mapear tipos para classes de validação
    const validationMap = {
      body: {
        email: 'CreateUserDto',
        password: 'CreateUserDto',
        // Adicionar mais mapeamentos conforme necessário
      },
      query: {
        page: 'PaginationDto',
        limit: 'PaginationDto',
        // Adicionar mais mapeamentos conforme necessário
      },
      params: {
        id: 'IdParamDto',
        // Adicionar mais mapeamentos conforme necessário
      },
    };

    // Lógica simples para determinar a classe de validação
    // Em um projeto real, isso seria mais sofisticado
    return null; // Por enquanto, retornar null para usar validação básica
  }

  private formatValidationErrors(errors: any[]): string[] {
    const messages: string[] = [];

    errors.forEach(error => {
      if (error.constraints) {
        Object.values(error.constraints).forEach(message => {
          messages.push(message as string);
        });
      }

      if (error.children && error.children.length > 0) {
        const childMessages = this.formatValidationErrors(error.children);
        messages.push(...childMessages);
      }
    });

    return messages;
  }
}
