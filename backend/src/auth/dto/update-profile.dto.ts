import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Biografia do usuário',
    example: 'Desenvolvedor Full Stack com 5 anos de experiência',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Habilidades do usuário (JSON array)',
    example: '["JavaScript", "React", "Node.js"]',
    required: false,
  })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiProperty({
    description: 'Experiência profissional',
    example: '5 anos de experiência em desenvolvimento web',
    required: false,
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({
    description: 'Formação acadêmica',
    example: 'Bacharelado em Ciência da Computação',
    required: false,
  })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({
    description: 'Link do portfólio',
    example: 'https://meuportfolio.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  portfolio?: string;

  @ApiProperty({
    description: 'Website pessoal',
    example: 'https://meusite.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    description: 'Perfil do LinkedIn',
    example: 'https://linkedin.com/in/meuperfil',
    required: false,
  })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({
    description: 'Perfil do GitHub',
    example: 'https://github.com/meuperfil',
    required: false,
  })
  @IsOptional()
  @IsString()
  github?: string;

  @ApiProperty({
    description: 'Valor por hora (para freelancers)',
    example: 50.00,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiProperty({
    description: 'Disponibilidade',
    example: '40 horas por semana',
    required: false,
  })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiProperty({
    description: 'Fuso horário',
    example: 'America/Sao_Paulo',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'Idiomas (JSON array)',
    example: '["Português", "Inglês", "Espanhol"]',
    required: false,
  })
  @IsOptional()
  @IsString()
  languages?: string;

  // Company specific fields
  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Minha Empresa LTDA',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({
    description: 'Tamanho da empresa',
    example: '10-50 funcionários',
    required: false,
  })
  @IsOptional()
  @IsString()
  companySize?: string;

  @ApiProperty({
    description: 'Setor da empresa',
    example: 'Tecnologia',
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({
    description: 'Descrição da empresa',
    example: 'Empresa focada em soluções inovadoras',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyDescription?: string;
}
