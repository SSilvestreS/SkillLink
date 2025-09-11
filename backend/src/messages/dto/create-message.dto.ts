import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá! Gostaria de discutir os detalhes do projeto.',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Tipo da mensagem',
    enum: MessageType,
    example: MessageType.TEXT,
    required: false,
  })
  @IsOptional()
  @IsEnum(MessageType, { message: 'Tipo de mensagem inválido' })
  type?: MessageType;

  @ApiProperty({
    description: 'ID do destinatário',
    example: 'uuid-do-destinatario',
  })
  @IsString()
  receiverId: string;

  @ApiProperty({
    description: 'ID do contrato',
    example: 'uuid-do-contrato',
  })
  @IsString()
  contractId: string;

  @ApiProperty({
    description: 'Nome do arquivo (se for mensagem com arquivo)',
    example: 'proposta.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({
    description: 'URL do arquivo (se for mensagem com arquivo)',
    example: '/uploads/proposta.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes (se for mensagem com arquivo)',
    example: 1024000,
    required: false,
  })
  @IsOptional()
  fileSize?: number;
}
