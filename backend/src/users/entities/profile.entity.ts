import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  skills?: string; // JSON string array

  @Column({ nullable: true })
  experience?: string;

  @Column({ nullable: true })
  education?: string;

  @Column({ nullable: true })
  portfolio?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  linkedin?: string;

  @Column({ nullable: true })
  github?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Column({ nullable: true })
  availability?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ nullable: true })
  languages?: string; // JSON string array

  // Company specific fields
  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  companySize?: string;

  @Column({ nullable: true })
  industry?: string;

  @Column({ nullable: true })
  companyDescription?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;
}
