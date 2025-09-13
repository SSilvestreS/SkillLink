import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo pagamento' })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos' })
  async getMyPayments(@Request() req) {
    return this.paymentsService.getPaymentsByUser(req.user.sub);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de pagamentos' })
  @ApiResponse({ status: 200, description: 'Estatísticas de pagamentos' })
  async getPaymentStats(@Request() req) {
    return this.paymentsService.getPaymentStats(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter pagamento por ID' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  async getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirmar pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento confirmado' })
  @ApiResponse({ status: 400, description: 'Pagamento não pode ser confirmado' })
  async confirmPayment(
    @Param('id') id: string,
    @Body('stripePaymentIntentId') stripePaymentIntentId?: string,
  ) {
    return this.paymentsService.confirmPayment(id, stripePaymentIntentId);
  }
}
