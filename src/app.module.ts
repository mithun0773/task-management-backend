import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { User } from './modules/users/entities/user.entity';
import { Project } from './modules/projects/entities/project.entity';
import { Task } from './modules/tasks/entities/task.entity';
import { Attachment } from './modules/attachments/entities/attachment.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
import { ProjectsModule } from './modules/projects/projects.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TasksModule } from './modules/tasks/task.module';
import { ReportsModule } from './modules/reports/reports.module';
import { Report } from './modules/reports/entities/report.entity';
import { ReportComment } from './modules/reports/entities/report-comment-entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const port = parseInt(
          configService.get<string>('DB_PORT') || '5433',
          10,
        );
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_DATABASE');
        if (!password) {
          throw new Error('❌ DB_PASSWORD is missing in your .env file!');
        }
        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          ssl: {
            rejectUnauthorized: false,
          },
          entities: [
            User,
            Project,
            Task,
            Attachment,
            Notification,
            Report,
            ReportComment,
          ],
          synchronize: false,
          logging: false,
        };
      },
    }),

    UsersModule,
    AuthModule,
    ProjectsModule,
    DashboardModule,
    TasksModule,
    ReportsModule,
  ],
})
export class AppModule {}
