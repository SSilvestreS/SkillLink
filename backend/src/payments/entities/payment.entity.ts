import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Contract } from '../../contracts/entities/contract.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  STRIPE_CARD = 'stripe_card',
  STRIPE_PIX = 'stripe_pix',
  PIX_DIRECT = 'pix_direct',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO_BITCOIN = 'crypto_bitcoin',
  CRYPTO_ETHEREUM = 'crypto_ethereum',
}

export enum PaymentType {
  CONTRACT_PAYMENT = 'contract_payment',
  PLATFORM_FEE = 'platform_fee',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  freelancerAmount: number;

  @Column({ length: 3, default: 'BRL' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @Column({ nullable: true })
  stripeChargeId?: string;

  @Column({ nullable: true })
  pixCode?: string;

  @Column({ nullable: true })
  pixQrCode?: string;

  @Column({ nullable: true })
  pixExpiresAt?: Date;

  @Column({ nullable: true })
  transactionId?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string; // JSON string

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt?: Date;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'payerId' })
  payer: User;

  @Column()
  payerId: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => Contract, (contract) => contract.id, { nullable: true })
  @JoinColumn({ name: 'contractId' })
  contract?: Contract;

  @Column({ nullable: true })
  contractId?: string;
}
