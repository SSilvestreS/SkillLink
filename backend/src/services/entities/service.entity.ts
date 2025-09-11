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
import { Contract } from '../../contracts/entities/contract.entity';

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
}

export enum ServiceType {
  FIXED_PRICE = 'fixed_price',
  HOURLY = 'hourly',
  PROJECT_BASED = 'project_based',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
    default: ServiceType.FIXED_PRICE,
  })
  type: ServiceType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: true })
  estimatedHours?: number;

  @Column({ type: 'int' })
  deliveryDays: number;

  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.ACTIVE,
  })
  status: ServiceStatus;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  tags?: string; // JSON string array

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  orders: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.services)
  @JoinColumn({ name: 'freelancerId' })
  freelancer: User;

  @Column()
  freelancerId: string;

  @OneToMany(() => Contract, (contract) => contract.service)
  contracts: Contract[];
}
