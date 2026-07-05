import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ example: 'Homepage Design Final' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Final Version of homepage design' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'project-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  project_id: string;
}
