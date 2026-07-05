import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, Not, In } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Report } from '../reports/entities/report.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async getStats(user: any) {
    const isPM = user.role === 'PROJECT_MANAGER';
    const isMember = user.role === 'TEAM_MEMBER';
    const isAdmin = user.role === 'ADMIN';

    let projects, tasks, inProgress, completed;

    if (isMember) {
      // Team member sees only assigned tasks
      projects = await this.projectRepository.count();
      tasks = await this.taskRepository.count({
        where: { assignee_id: user.id },
      });
      inProgress = await this.taskRepository.count({
        where: { assignee_id: user.id, status: 'IN_PROGRESS' },
      });
      completed = await this.taskRepository.count({
        where: { assignee_id: user.id, status: 'DONE' },
      });
    } else {
      // Admin and PM see everything
      projects = await this.projectRepository.count();
      tasks = await this.taskRepository.count();
      inProgress = await this.taskRepository.count({
        where: { status: 'IN_PROGRESS' },
      });
      completed = await this.taskRepository.count({
        where: { status: 'DONE' },
      });
    }

    return {
      totalProjects: projects,
      totalTasks: tasks,
      inProgress,
      completed,
    };
  }

  async getTaskDistribution(user: any) {
    const isMember = user.role === 'TEAM_MEMBER';

    let tasks;
    if (isMember) {
      tasks = await this.taskRepository.find({
        where: { assignee_id: user.id },
      });
    } else {
      tasks = await this.taskRepository.find();
    }

    return [
      {
        name: 'To Do',
        value: tasks.filter((t) => t.status === 'TODO').length,
        color: '#94a3b8',
      },
      {
        name: 'In Progress',
        value: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        color: '#3b82f6',
      },
      {
        name: 'Review',
        value: tasks.filter((t) => t.status === 'IN_REVIEW').length,
        color: '#f59e0b',
      },
      {
        name: 'Done',
        value: tasks.filter((t) => t.status === 'DONE').length,
        color: '#10b981',
      },
    ];
  }

  async getUpcomingTasks(user: any, limit = 4) {
    const isMember = user.role === 'TEAM_MEMBER';

    const whereCondition: any = {
      status: Not(In(['DONE'])),
    };

    if (isMember) {
      whereCondition.assignee_id = user.id;
    }

    return await this.taskRepository.find({
      relations: { assignee: true, project: true },
      where: whereCondition,
      order: { due_date: 'ASC' },
      take: limit,
    });
  }

  async getRecentProjects(user: any, limit = 3) {
    return await this.projectRepository.find({
      relations: { owner: true },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getTeamWorkload(user: any) {
    const users = await this.userRepository.find({
      relations: { assigned_tasks: true },
    });

    return users.map((user) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      avatar: `${user.first_name[0]}${user.last_name[0]}`,
      workload: user.assigned_tasks?.length || 0,
      maxWorkload: 10,
    }));
  }

  async getTeamStats(user: any) {
    const users = await this.userRepository.find({
      relations: {
        owned_projects: true,
        assigned_tasks: true,
      },
    });

    return users.map((user) => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      projectsCount: user.owned_projects?.length || 0,
      tasksCount: user.assigned_tasks?.length || 0,
      avatar: `${user.first_name[0]}${user.last_name[0]}`,
    }));
  }

  async search(query: string, type: string, user: any) {
    const searchTerm = `%${query}%`;
    const isMember = user.role === 'TEAM_MEMBER';

    const results: {
      projects: Project[];
      tasks: Task[];
      users: User[];
    } = {
      projects: [],
      tasks: [],
      users: [],
    };

    // Search Projects
    if (!type || type === 'projects') {
      results.projects = await this.projectRepository.find({
        where: [
          { name: ILike(searchTerm) },
          { description: ILike(searchTerm) },
        ],
        relations: { owner: true },
        take: 10,
      });
    }

    // Search Tasks
    if (!type || type === 'tasks') {
      if (isMember) {
        results.tasks = await this.taskRepository.find({
          where: [
            { title: ILike(searchTerm), assignee_id: user.id },
            { description: ILike(searchTerm), assignee_id: user.id },
          ],
          relations: { assignee: true, project: true },
          take: 10,
        });
      } else {
        results.tasks = await this.taskRepository.find({
          where: [
            { title: ILike(searchTerm) },
            { description: ILike(searchTerm) },
          ],
          relations: { assignee: true, project: true },
          take: 10,
        });
      }
    }

    // Search Users (Admin/PM only)
    if ((!type || type === 'users') && !isMember) {
      results.users = await this.userRepository.find({
        where: [
          { first_name: ILike(searchTerm) },
          { last_name: ILike(searchTerm) },
          { email: ILike(searchTerm) },
        ],
        take: 10,
      });
    }

    return results;
  }
}
