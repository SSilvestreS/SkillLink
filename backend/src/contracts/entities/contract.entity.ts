import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { Message } from '../../messages/entities/message.entity';

export enum ContractStatus {
  PROPOSAL = 'proposal',
  NEGOTIATING = 'negotiating',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ContractType {
  FIXED_PRICE = 'fixed_price',
  HOURLY = 'hourly',
  PROJECT_BASED = 'project_based',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ContractType,
  })
  type: ContractType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalValue: number;

  @Column({ type: 'int', nullable: true })
  estimatedHours?: number;

  @Column({ type: 'int' })
  deliveryDays: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PROPOSAL,
  })
  status: ContractStatus;

  @Column({ type: 'text', nullable: true })
  requirements?: string;

  @Column({ type: 'text', nullable: true })
  deliverables?: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'text', nullable: true })
  deliveryNotes?: string;

  @Column({ type: 'text', nullable: true })
  companyNotes?: string;

  @Column({ type: 'text', nullable: true })
  freelancerNotes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.companyContracts)
  @JoinColumn({ name: 'companyId' })
  company: User;

  @Column()
  companyId: string;

  @ManyToOne(() => User, (user) => user.freelancerContracts)
  @JoinColumn({ name: 'freelancerId' })
  freelancer: User;

  @Column()
  freelancerId: string;

  @ManyToOne(() => Service, (service) => service.contracts, { nullable: true })
  @JoinColumn({ name: 'serviceId' })
  service?: Service;

  @Column({ nullable: true })
  serviceId?: string;

  @OneToMany(() => Message, (message) => message.contract)
  messages: Message[];
}
