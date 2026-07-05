import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    ownerId: string,
  ): Promise<Project> {
    const newProject = this.projectRepository.create({
      ...createProjectDto,
      owner_id: ownerId,
      status: 'PLANNING',
    });
    return this.projectRepository.save(newProject);
  }

  async findAll(): Promise<Project[]> {
    // ✅ FIX: Use simpler relations syntax
    try {
      return await this.projectRepository.find({
        relations: {
          owner: true,
        },
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Project> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id },
        relations: {
          owner: true,
        },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.projectRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return { message: `Project with ID ${id} successfully deleted` };
  }
}
