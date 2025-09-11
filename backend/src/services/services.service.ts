import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Service, ServiceStatus } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto, freelancerId: string): Promise<Service> {
    const service = this.serviceRepository.create({
      ...createServiceDto,
      freelancerId,
    });

    return this.serviceRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({
      relations: ['freelancer', 'freelancer.profile'],
      where: { status: ServiceStatus.ACTIVE },
    });
  }

  async findByFreelancer(freelancerId: string): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { freelancerId },
      relations: ['freelancer', 'freelancer.profile'],
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['freelancer', 'freelancer.profile', 'contracts'],
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    // Increment view count
    await this.serviceRepository.increment({ id }, 'views', 1);

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, userId: string): Promise<Service> {
    const service = await this.findOne(id);

    if (service.freelancerId !== userId) {
      throw new ForbiddenException('Você só pode editar seus próprios serviços');
    }

    Object.assign(service, updateServiceDto);
    return this.serviceRepository.save(service);
  }

  async remove(id: string, userId: string): Promise<void> {
    const service = await this.findOne(id);

    if (service.freelancerId !== userId) {
      throw new ForbiddenException('Você só pode remover seus próprios serviços');
    }

    await this.serviceRepository.remove(service);
  }

  async search(query: string, category?: string): Promise<Service[]> {
    const qb = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.freelancer', 'freelancer')
      .leftJoinAndSelect('freelancer.profile', 'profile')
      .where('service.status = :status', { status: ServiceStatus.ACTIVE });

    if (query) {
      qb.andWhere(
        '(service.title ILIKE :query OR service.description ILIKE :query OR service.tags ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (category) {
      qb.andWhere('service.category = :category', { category });
    }

    return qb.getMany();
  }
}
