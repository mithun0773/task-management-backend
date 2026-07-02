import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_name' })
  file_name: string;

  @Column({ name: 'file_url' })
  file_url: string;

  @Column({ name: 'mime_type' })
  mime_type: string;

  @Column({ name: 'file_size', type: 'int' })
  file_size: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Task, (task) => task.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id' })
  task_id: string;

  @ManyToOne(() => User)
  uploaded_by: User;

  @Column({ name: 'uploaded_by_id' })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploaded_by_id: string;
}
