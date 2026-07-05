import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Report } from './report.entity';

@Entity('report_comments')
export class ReportComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @ManyToOne(() => Report, (report) => report.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column({ name: 'report_id', type: 'uuid' })
  report_id: string;

  // ✅ FIX: Make parent_id nullable in TypeScript
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parent_id: string | null;

  @ManyToOne(() => ReportComment, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: ReportComment;

  @OneToMany(() => ReportComment, (comment) => comment.parent)
  replies: ReportComment[];
}
