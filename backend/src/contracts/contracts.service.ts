import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contract, ContractStatus } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {}

  async create(createContractDto: CreateContractDto, companyId: string): Promise<Contract> {
    const contract = this.contractRepository.create({
      ...createContractDto,
      companyId,
    });

    return this.contractRepository.save(contract);
  }

  async findAll(): Promise<Contract[]> {
    return this.contractRepository.find({
      relations: ['company', 'freelancer', 'service'],
    });
  }

  async findByUser(userId: string): Promise<Contract[]> {
    return this.contractRepository.find({
      where: [
        { companyId: userId },
        { freelancerId: userId },
      ],
      relations: ['company', 'freelancer', 'service'],
    });
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['company', 'freelancer', 'service', 'messages'],
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto, userId: string): Promise<Contract> {
    const contract = await this.findOne(id);

    if (contract.companyId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('Você só pode editar contratos em que participa');
    }

    Object.assign(contract, updateContractDto);
    return this.contractRepository.save(contract);
  }

  async updateStatus(id: string, status: ContractStatus, userId: string): Promise<Contract> {
    const contract = await this.findOne(id);

    if (contract.companyId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('Você só pode alterar status de contratos em que participa');
    }

    contract.status = status;
    return this.contractRepository.save(contract);
  }

  async remove(id: string, userId: string): Promise<void> {
    const contract = await this.findOne(id);

    if (contract.companyId !== userId) {
      throw new ForbiddenException('Apenas a empresa pode cancelar o contrato');
    }

    await this.contractRepository.remove(contract);
  }
}
