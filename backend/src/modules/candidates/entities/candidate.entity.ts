import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Resume } from '../../resumes/entities/resume.entity';

export enum CandidateStatus {
  PENDING = 'pending',
  SHORTLISTED = 'shortlisted',
  INTERVIEWING = 'interviewing',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'jsonb', nullable: true })
  education: {
    school: string;
    major: string;
    degree: string;
    graduationDate: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  workExperience: {
    company: string;
    position: string;
    period: string;
    summary: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  @Column({ type: 'jsonb', nullable: true })
  projects: {
    name: string;
    techStack: string[];
    role: string;
    highlights: string;
  }[];

  @Column({
    type: 'enum',
    enum: CandidateStatus,
    default: CandidateStatus.PENDING,
  })
  status: CandidateStatus;

  @Column({ type: 'float', nullable: true })
  overallScore: number;

  @OneToMany(() => Resume, (resume) => resume.candidate, { cascade: true })
  resumes: Resume[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
