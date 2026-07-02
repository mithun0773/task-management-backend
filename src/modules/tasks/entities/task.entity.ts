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
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
    default: 'TODO',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  })
  priority: string;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  due_date: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({name:'project_id'})
  project: Project;

  @Column({ name: 'project_id' })
  project_id: string;

  @ManyToOne(() => User, (user) => user.assigned_tasks, { nullable: true })
  @JoinColumn({name:'assignee_id'})
  assignee: User;

  @Column({ name: 'assignee_id', nullable: true })
  assignee_id: string;

  @ManyToOne(() => User)
  @JoinColumn({name:'creator_id'})
  creator: User;

  @Column({ name: 'creator_id' })
  creator_id: string;

  @OneToMany(() => Attachment, (attachment) => attachment.task)
  attachments: Attachment[];
}
