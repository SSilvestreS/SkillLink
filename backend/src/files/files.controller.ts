import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de arquivo' })
  @ApiResponse({ status: 201, description: 'Arquivo enviado com sucesso' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.filesService.create(file, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter arquivo por ID' })
  @ApiResponse({ status: 200, description: 'Arquivo encontrado' })
  @ApiResponse({ status: 404, description: 'Arquivo não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Get('contract/:contractId')
  @ApiOperation({ summary: 'Obter arquivos de um contrato' })
  @ApiResponse({ status: 200, description: 'Lista de arquivos' })
  async findByContract(@Param('contractId') contractId: string) {
    return this.filesService.findByContract(contractId);
  }

  @Get('my-files')
  @ApiOperation({ summary: 'Obter meus arquivos' })
  @ApiResponse({ status: 200, description: 'Lista dos meus arquivos' })
  async findMyFiles(@Request() req) {
    return this.filesService.findByUser(req.user.sub);
  }
}
