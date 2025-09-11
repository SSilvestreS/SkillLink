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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ContractStatus } from '../contracts/entities/contract.entity';

@ApiTags('Contracts')
@Controller('contracts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Criar novo contrato (apenas empresas)' })
  @ApiResponse({ status: 201, description: 'Contrato criado com sucesso' })
  async create(@Body() createContractDto: CreateContractDto, @Request() req) {
    return this.contractsService.create(createContractDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Listar meus contratos' })
  @ApiResponse({ status: 200, description: 'Lista de contratos' })
  async findMyContracts(@Request() req) {
    return this.contractsService.findByUser(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter contrato por ID' })
  @ApiResponse({ status: 200, description: 'Contrato encontrado' })
  @ApiResponse({ status: 404, description: 'Contrato não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar contrato' })
  @ApiResponse({ status: 200, description: 'Contrato atualizado' })
  async update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto, @Request() req) {
    return this.contractsService.update(id, updateContractDto, req.user.sub);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do contrato' })
  @ApiResponse({ status: 200, description: 'Status atualizado' })
  async updateStatus(@Param('id') id: string, @Body('status') status: ContractStatus, @Request() req) {
    return this.contractsService.updateStatus(id, status, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Cancelar contrato (apenas empresa)' })
  @ApiResponse({ status: 200, description: 'Contrato cancelado' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.contractsService.remove(id, req.user.sub);
    return { message: 'Contrato cancelado com sucesso' };
  }
}
