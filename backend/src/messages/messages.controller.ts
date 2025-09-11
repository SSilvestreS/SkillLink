import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar mensagem' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  async create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.messagesService.create(createMessageDto, req.user.sub);
  }

  @Get('contract/:contractId')
  @ApiOperation({ summary: 'Obter mensagens de um contrato' })
  @ApiResponse({ status: 200, description: 'Lista de mensagens' })
  async findByContract(@Param('contractId') contractId: string) {
    return this.messagesService.findByContract(contractId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar mensagem como lida' })
  @ApiResponse({ status: 200, description: 'Mensagem marcada como lida' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.messagesService.markAsRead(id, req.user.sub);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Contar mensagens não lidas' })
  @ApiResponse({ status: 200, description: 'Número de mensagens não lidas' })
  async getUnreadCount(@Request() req) {
    const count = await this.messagesService.getUnreadCount(req.user.sub);
    return { unreadCount: count };
  }
}
