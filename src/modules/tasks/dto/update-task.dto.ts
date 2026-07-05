import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] })
  @IsEnum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'user-uuid-here' })
  @IsUUID()
  @IsOptional()
  assignee_id?: string;
}
