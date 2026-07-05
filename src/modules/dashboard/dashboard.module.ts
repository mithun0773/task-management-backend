import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.services';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Report } from '../reports/entities/report.entity'; // 👈 ADD THIS IMPORT

@Module({
  imports: [
    // 👇 ADD Report TO THIS ARRAY
    TypeOrmModule.forFeature([Project, Task, User, Report]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
