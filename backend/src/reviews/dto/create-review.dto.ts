import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Nota da avaliação (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1, { message: 'Nota deve ser pelo menos 1' })
  @Max(5, { message: 'Nota deve ser no máximo 5' })
  rating: number;

  @ApiProperty({
    description: 'Comentário da avaliação',
    example: 'Excelente trabalho! Muito profissional e pontual.',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: 'ID do usuário avaliado',
    example: 'uuid-do-usuario-avaliado',
  })
  @IsString()
  reviewedId: string;

  @ApiProperty({
    description: 'ID do contrato',
    example: 'uuid-do-contrato',
  })
  @IsString()
  contractId: string;
}
