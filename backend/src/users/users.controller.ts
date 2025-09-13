import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os usuários (apenas admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('freelancers')
  @ApiOperation({ summary: 'Listar freelancers' })
  @ApiResponse({ status: 200, description: 'Lista de freelancers' })
  async findFreelancers() {
    return this.usersService.findByRole(UserRole.FREELANCER);
  }

  @Get('companies')
  @ApiOperation({ summary: 'Listar empresas' })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  async findCompanies() {
    return this.usersService.findByRole(UserRole.COMPANY);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário (apenas admin)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover usuário (apenas admin)' })
  @ApiResponse({ status: 200, description: 'Usuário removido' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'Usuário removido com sucesso' };
  }
}
