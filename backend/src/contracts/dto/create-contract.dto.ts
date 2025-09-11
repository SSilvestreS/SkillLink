import { IsString, IsNumber, IsEnum, IsOptional, MinLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContractType } from '../entities/contract.entity';

export class CreateContractDto {
  @ApiProperty({
    description: 'Título do contrato',
    example: 'Desenvolvimento de aplicativo mobile',
  })
  @IsString()
  @MinLength(5, { message: 'Título deve ter pelo menos 5 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Descrição do contrato',
    example: 'Desenvolver aplicativo mobile para iOS e Android...',
  })
  @IsString()
  @MinLength(20, { message: 'Descrição deve ter pelo menos 20 caracteres' })
  description: string;

  @ApiProperty({
    description: 'Tipo de contrato',
    enum: ContractType,
    example: ContractType.FIXED_PRICE,
  })
  @IsEnum(ContractType, { message: 'Tipo de contrato inválido' })
  type: ContractType;

  @ApiProperty({
    description: 'Valor total do contrato',
    example: 5000.00,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  totalValue: number;

  @ApiProperty({
    description: 'Horas estimadas (para contratos por hora)',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Horas estimadas deve ser pelo menos 1' })
  estimatedHours?: number;

  @ApiProperty({
    description: 'Prazo de entrega em dias',
    example: 60,
  })
  @IsNumber()
  @Min(1, { message: 'Prazo deve ser pelo menos 1 dia' })
  deliveryDays: number;

  @ApiProperty({
    description: 'ID do freelancer',
    example: 'uuid-do-freelancer',
  })
  @IsString()
  freelancerId: string;

  @ApiProperty({
    description: 'ID do serviço (opcional)',
    example: 'uuid-do-servico',
    required: false,
  })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({
    description: 'Requisitos do projeto',
    example: 'Aplicativo deve funcionar offline...',
    required: false,
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiProperty({
    description: 'Entregáveis do projeto',
    example: 'Código fonte, documentação, APK...',
    required: false,
  })
  @IsOptional()
  @IsString()
  deliverables?: string;
}
