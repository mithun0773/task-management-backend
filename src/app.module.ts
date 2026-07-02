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
        // 🎯 Using YOUR variable names from .env
        const host = configService.get<string>('DB_HOST');
        const port = parseInt(
          configService.get<string>('DB_PORT') || '5433',
          10,
        );
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_DATABASE');

        console.log('========== DATABASE CONFIG ==========');
        console.log('HOST      :', host);
        console.log('PORT      :', port);
        console.log('USERNAME  :', username);
        console.log('PASSWORD  :', password ? '********' : '❌ UNDEFINED');
        console.log('DATABASE  :', database);
        console.log('=====================================');

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
          entities: [User, Project, Task, Attachment, Notification],
          synchronize: true,
          logging: false,
        };
      },
    }),

    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
