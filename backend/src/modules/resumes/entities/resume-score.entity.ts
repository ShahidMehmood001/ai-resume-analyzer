import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne,
} from 'typeorm';
import { Resume } from './resume.entity';
import { Job } from '../../jobs/entities/job.entity';

@Entity('resume_scores')
export class ResumeScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Resume, (r) => r.scores, { onDelete: 'CASCADE' })
  resume: Resume;

  @Column()
  resumeId: string;

  @ManyToOne(() => Job, (j) => j.scores, { onDelete: 'CASCADE' })
  job: Job;

  @Column()
  jobId: string;

  @Column({ type: 'float' })
  overallScore: number;

  @Column({ type: 'float' })
  skillMatch: number;

  @Column({ type: 'float' })
  experienceRelevance: number;

  @Column({ type: 'float' })
  educationFit: number;

  @Column({ type: 'text' })
  aiComment: string;

  @CreateDateColumn()
  createdAt: Date;
}
