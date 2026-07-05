import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import * as path from 'path';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report-dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard) // ✅ All authenticated users can access
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEAM_MEMBER', 'PROJECT_MANAGER') // ✅ Members AND PMs can submit
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/reports',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        project_id: { type: 'string' },
      },
    },
  })
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createReportDto: CreateReportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.create(createReportDto, file, userId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.reportsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const report = await this.reportsService.findOne(id);
    const filePath = path.resolve(report.file_path);
    res.download(filePath, report.file_name);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('PROJECT_MANAGER') // ✅ Only PMs can update status
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.updateStatus(id, status, user);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: any, // ✅ All authenticated users can comment/reply
  ) {
    return this.reportsService.addComment(id, createCommentDto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('PROJECT_MANAGER') // ✅ Only PMs can delete
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reportsService.remove(id, user);
  }
}
