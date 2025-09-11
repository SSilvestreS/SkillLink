import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FREELANCER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo serviço (apenas freelancers)' })
  @ApiResponse({ status: 201, description: 'Serviço criado com sucesso' })
  @ApiResponse({ status: 403, description: 'Apenas freelancers podem criar serviços' })
  async create(@Body() createServiceDto: CreateServiceDto, @Request() req) {
    return this.servicesService.create(createServiceDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os serviços ativos' })
  @ApiResponse({ status: 200, description: 'Lista de serviços' })
  async findAll() {
    return this.servicesService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar serviços' })
  @ApiResponse({ status: 200, description: 'Resultados da busca' })
  async search(@Query('q') query: string, @Query('category') category?: string) {
    return this.servicesService.search(query, category);
  }

  @Get('my-services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FREELANCER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar meus serviços (apenas freelancers)' })
  @ApiResponse({ status: 200, description: 'Lista dos meus serviços' })
  async findMyServices(@Request() req) {
    return this.servicesService.findByFreelancer(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter serviço por ID' })
  @ApiResponse({ status: 200, description: 'Serviço encontrado' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FREELANCER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar serviço (apenas o dono)' })
  @ApiResponse({ status: 200, description: 'Serviço atualizado' })
  @ApiResponse({ status: 403, description: 'Você só pode editar seus próprios serviços' })
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto, @Request() req) {
    return this.servicesService.update(id, updateServiceDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FREELANCER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover serviço (apenas o dono)' })
  @ApiResponse({ status: 200, description: 'Serviço removido' })
  @ApiResponse({ status: 403, description: 'Você só pode remover seus próprios serviços' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.servicesService.remove(id, req.user.sub);
    return { message: 'Serviço removido com sucesso' };
  }
}
