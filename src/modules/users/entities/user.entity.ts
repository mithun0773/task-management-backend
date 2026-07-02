import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  first_name: string;

  @Column({ length: 50 })
  last_name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ name: 'password_hash' })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'],
    default: 'TEAM_MEMBER',
  })
  role: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatar_url: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => Project, (project) => project.owner)
  owned_projects: Project[];

  @ManyToMany(() => Project, (project) => project.members)
  member_projects: Project[];

  @OneToMany(() => Task, (task) => task.assignee)
  assigned_tasks: Task[];
}
