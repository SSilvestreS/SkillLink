import { IsString, IsNumber, IsEnum, IsOptional, MinLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '../entities/service.entity';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Título do serviço',
    example: 'Desenvolvimento de aplicativo mobile',
  })
  @IsString()
  @MinLength(5, { message: 'Título deve ter pelo menos 5 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do serviço',
    example: 'Desenvolvo aplicativos mobile nativos para iOS e Android usando React Native...',
  })
  @IsString()
  @MinLength(20, { message: 'Descrição deve ter pelo menos 20 caracteres' })
  description: string;

  @ApiProperty({
    description: 'Tipo de serviço',
    enum: ServiceType,
    example: ServiceType.FIXED_PRICE,
  })
  @IsEnum(ServiceType, { message: 'Tipo de serviço inválido' })
  type: ServiceType;

  @ApiProperty({
    description: 'Preço do serviço',
    example: 500.00,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Preço deve ser maior que zero' })
  price: number;

  @ApiProperty({
    description: 'Horas estimadas (para serviços por hora)',
    example: 40,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Horas estimadas deve ser pelo menos 1' })
  estimatedHours?: number;

  @ApiProperty({
    description: 'Prazo de entrega em dias',
    example: 30,
  })
  @IsNumber()
  @Min(1, { message: 'Prazo deve ser pelo menos 1 dia' })
  deliveryDays: number;

  @ApiProperty({
    description: 'Categoria do serviço',
    example: 'Desenvolvimento Mobile',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Tags do serviço (JSON array)',
    example: '["React Native", "Mobile", "iOS", "Android"]',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;
}
