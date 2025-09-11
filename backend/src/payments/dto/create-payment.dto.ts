import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Valor do pagamento',
    example: 1000.00,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  amount: number;

  @ApiProperty({
    description: 'ID do contrato',
    example: 'uuid-do-contrato',
    required: false,
  })
  @IsOptional()
  @IsString()
  contractId?: string;

  @ApiProperty({
    description: 'ID do pagador',
    example: 'uuid-do-pagador',
  })
  @IsString()
  payerId: string;

  @ApiProperty({
    description: 'ID do recebedor',
    example: 'uuid-do-recebedor',
  })
  @IsString()
  receiverId: string;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    example: PaymentMethod.STRIPE_PIX,
  })
  @IsEnum(PaymentMethod, { message: 'Método de pagamento inválido' })
  method: PaymentMethod;

  @ApiProperty({
    description: 'Descrição do pagamento',
    example: 'Pagamento pelo contrato de desenvolvimento web',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
