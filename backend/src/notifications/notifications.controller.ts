import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de notificações' })
  async findByUser(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationsService.findByUser(req.user.sub, page, limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  @ApiResponse({ status: 200, description: 'Número de notificações não lidas' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { unreadCount: count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Todas as notificações marcadas como lidas' })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.sub);
    return { message: 'Todas as notificações foram marcadas como lidas' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar notificação' })
  @ApiResponse({ status: 200, description: 'Notificação deletada' })
  async delete(@Param('id') id: string, @Request() req) {
    await this.notificationsService.delete(id, req.user.sub);
    return { message: 'Notificação deletada com sucesso' };
  }
}
