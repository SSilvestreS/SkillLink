import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extname } from 'path';

import { File, FileType } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async create(file: Express.Multer.File, uploadedById: string, contractId?: string): Promise<File> {
    const fileType = this.getFileType(file.mimetype);
    
    const fileEntity = this.fileRepository.create({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
      type: fileType,
      uploadedById,
      contractId,
    });

    return this.fileRepository.save(fileEntity);
  }

  async findOne(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    return file;
  }

  async findByContract(contractId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: { contractId },
      relations: ['uploadedBy'],
    });
  }

  async findByUser(userId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: { uploadedById: userId },
    });
  }

  private getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    if (mimeType.startsWith('audio/')) return FileType.AUDIO;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileType.DOCUMENT;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return FileType.ARCHIVE;
    return FileType.OTHER;
  }
}
