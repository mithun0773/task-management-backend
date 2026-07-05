import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design homepage' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Create a modern homepage design' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
    default: 'TODO',
  })
  @IsEnum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ example: '2026-07-20' })
  @IsDateString()
  @IsOptional()
  due_date?: string;

  @ApiProperty({ example: 'project-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  project_id: string;

  @ApiPropertyOptional({ example: 'user-uuid-here' })
  @IsUUID()
  @IsOptional()
  assignee_id?: string;
}
