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

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar avaliação' })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso' })
  async create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user.sub);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obter avaliações de um usuário' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações' })
  async findByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  @Get('contract/:contractId')
  @ApiOperation({ summary: 'Obter avaliações de um contrato' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações' })
  async findByContract(@Param('contractId') contractId: string) {
    return this.reviewsService.findByContract(contractId);
  }

  @Get('user/:userId/average')
  @ApiOperation({ summary: 'Obter nota média de um usuário' })
  @ApiResponse({ status: 200, description: 'Nota média' })
  async getAverageRating(@Param('userId') userId: string) {
    const average = await this.reviewsService.getAverageRating(userId);
    return { averageRating: average };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter avaliação por ID' })
  @ApiResponse({ status: 200, description: 'Avaliação encontrada' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação atualizada' })
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @Request() req) {
    return this.reviewsService.update(id, updateReviewDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação removida' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.reviewsService.remove(id, req.user.sub);
    return { message: 'Avaliação removida com sucesso' };
  }
}
