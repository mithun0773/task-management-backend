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
import { Project } from '../../projects/entities/project.entity';
import { ReportComment } from './report-comment-entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'file_name' })
  file_name: string;

  @Column({ name: 'file_path' })
  file_path: string;

  @Column({ name: 'file_type' })
  file_type: string;

  @Column({ name: 'file_size', type: 'bigint' })
  file_size: number;

  // ✅ UPDATED: Added NEEDS_ENHANCEMENT
  @Column({
    type: 'enum',
    enum: ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'NEEDS_ENHANCEMENT'],
    default: 'PENDING',
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'submitted_by_id', type: 'uuid' })
  submitted_by_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submitted_by_id' })
  submitted_by: User;

  @Column({ name: 'project_id', type: 'uuid' })
  project_id: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => ReportComment, (comment) => comment.report)
  comments: ReportComment[];
}
