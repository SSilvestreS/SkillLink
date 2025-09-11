import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Service } from '../../services/entities/service.entity';
import { Contract } from '../../contracts/entities/contract.entity';
import { Message } from '../../messages/entities/message.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum UserRole {
  ADMIN = 'admin',
  FREELANCER = 'freelancer',
  COMPANY = 'company',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.FREELANCER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Service, (service) => service.freelancer)
  services: Service[];

  @OneToMany(() => Contract, (contract) => contract.freelancer)
  freelancerContracts: Contract[];

  @OneToMany(() => Contract, (contract) => contract.company)
  companyContracts: Contract[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Review, (review) => review.reviewer)
  givenReviews: Review[];

  @OneToMany(() => Review, (review) => review.reviewed)
  receivedReviews: Review[];
}
