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

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @Column({
    type: 'enum',
    enum: FileType,
  })
  type: FileType;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column()
  uploadedById: string;

  @ManyToOne(() => Contract, (contract) => contract.id, { nullable: true })
  @JoinColumn({ name: 'contractId' })
  contract?: Contract;

  @Column({ nullable: true })
  contractId?: string;
}
