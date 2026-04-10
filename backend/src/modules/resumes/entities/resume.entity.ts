import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany,
} from 'typeorm';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { ResumeScore } from './resume-score.entity';

export enum ResumeStatus {
  UPLOADING = 'uploading',
  PARSING = 'parsing',
  EXTRACTING = 'extracting',
  DONE = 'done',
  FAILED = 'failed',
}

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  thumbnailPath: string;

  @Column({ type: 'text', nullable: true })
  rawText: string;

  @Column({
    type: 'enum',
    enum: ResumeStatus,
    default: ResumeStatus.UPLOADING,
  })
  status: ResumeStatus;

  @Column({ nullable: true })
  errorMessage: string;

  @ManyToOne(() => Candidate, (c) => c.resumes, { onDelete: 'CASCADE' })
  candidate: Candidate;

  @Column({ nullable: true })
  candidateId: string;

  @OneToMany(() => ResumeScore, (s) => s.resume, { cascade: true })
  scores: ResumeScore[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
