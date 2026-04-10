import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { ResumeScore } from '../../resumes/entities/resume-score.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  requiredSkills: string[];

  @Column({ type: 'jsonb', default: [] })
  bonusSkills: string[];

  @Column({ nullable: true })
  experienceYears: number;

  @Column({ nullable: true })
  educationLevel: string;

  @OneToMany(() => ResumeScore, (s) => s.job, { cascade: true })
  scores: ResumeScore[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
