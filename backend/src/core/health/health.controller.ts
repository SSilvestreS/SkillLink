import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';

// Declaração de tipo para process
declare const process: {
  uptime(): number;
};

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar saúde do sistema' })
  @ApiResponse({ status: 200, description: 'Sistema saudável' })
  @ApiResponse({ status: 503, description: 'Sistema com problemas' })
  async getHealth(@Res() res: Response) {
    const health = await this.healthService.getHealth();
    
    const statusCode = health.status === 'healthy' ? HttpStatus.OK : 
                      health.status === 'degraded' ? HttpStatus.OK : 
                      HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json(health);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obter métricas detalhadas do sistema' })
  @ApiResponse({ status: 200, description: 'Métricas obtidas com sucesso' })
  async getMetrics() {
    return this.healthService.getMetrics();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Verificar se o sistema está pronto' })
  @ApiResponse({ status: 200, description: 'Sistema pronto' })
  @ApiResponse({ status: 503, description: 'Sistema não está pronto' })
  async getReadiness(@Res() res: Response) {
    const health = await this.healthService.getHealth();
    
    if (health.status === 'healthy' || health.status === 'degraded') {
      res.status(HttpStatus.OK).json({ status: 'ready' });
    } else {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ status: 'not ready' });
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Verificar se o sistema está vivo' })
  @ApiResponse({ status: 200, description: 'Sistema vivo' })
  async getLiveness(@Res() res: Response) {
    res.status(HttpStatus.OK).json({ 
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  }
}
