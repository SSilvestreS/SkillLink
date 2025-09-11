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

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  rating: number; // 1-5 stars

  @Column('text', { nullable: true })
  comment?: string;

  @Column({ type: 'int', default: 0 })
  helpful: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.givenReviews)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User, (user) => user.receivedReviews)
  @JoinColumn({ name: 'reviewedId' })
  reviewed: User;

  @Column()
  reviewedId: string;

  @ManyToOne(() => Contract, (contract) => contract.id)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column()
  contractId: string;
}
