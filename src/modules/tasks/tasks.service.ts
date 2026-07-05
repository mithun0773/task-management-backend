import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, creatorId: string): Promise<Task> {
    const newTask = this.taskRepository.create({
      ...createTaskDto,
      creator_id: creatorId,
    });
    return this.taskRepository.save(newTask);
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: { assignee: true, project: true, creator: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: {
        assignee: true,
        project: true,
        creator: true,
        attachments: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: any,
  ): Promise<Task> {
    const task = await this.findOne(id);

    const isPM = user.role === 'PROJECT_MANAGER';
    const isAssignee = task.assignee_id === user.id;
    const isMember = user.role === 'TEAM_MEMBER';

    if (isMember && !isPM) {
      if (!isAssignee) {
        throw new ForbiddenException(
          'You can only update tasks assigned to you',
        );
      }

      const allowedFields = ['status'];
      const updateFields = Object.keys(updateTaskDto);
      const hasInvalidFields = updateFields.some(
        (field) => !allowedFields.includes(field),
      );

      if (hasInvalidFields) {
        throw new ForbiddenException('You can only update the status field');
      }
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.taskRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return { message: `Task with ID ${id} successfully deleted` };
  }

  async findByStatus(status: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { status },
      relations: { assignee: true, project: true },
      order: { due_date: 'ASC' },
    });
  }
}
