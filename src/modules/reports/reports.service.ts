import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Report } from './entities/report.entity';
import { ReportComment } from './entities/report-comment-entity';
import { CreateReportDto } from './dto/create-report-dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import * as fs from 'fs';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportComment)
    private readonly commentRepository: Repository<ReportComment>,
  ) {}

  async create(
    createReportDto: CreateReportDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Report> {
    const newReport = this.reportRepository.create({
      title: createReportDto.title,
      description: createReportDto.description,
      project_id: createReportDto.project_id,
      file_name: file.originalname,
      file_path: file.path,
      file_type: file.mimetype,
      file_size: file.size,
      submitted_by_id: userId,
      status: 'PENDING',
    });
    return this.reportRepository.save(newReport);
  }

  async findAll(user: any): Promise<Report[]> {
    const where: any = {};

    // ✅ FIX: Team members only see their own reports
    if (user.role === 'TEAM_MEMBER') {
      where.submitted_by_id = user.id;
    }
    // Admins and PMs see all reports (no filter)

    return this.reportRepository.find({
      where,
      relations: {
        submitted_by: true,
        project: true,
        comments: { user: true },
      } as any,
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: {
        submitted_by: true,
        project: true,
        comments: { user: true },
      } as any,
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async updateStatus(id: string, status: string, user: any): Promise<Report> {
    // Only PMs can update status
    if (user.role !== 'PROJECT_MANAGER') {
      throw new ForbiddenException(
        'Only Project Managers can update report status',
      );
    }

    const report = await this.findOne(id);
    report.status = status;
    return this.reportRepository.save(report);
  }

  async addComment(
    reportId: string,
    createCommentDto: CreateCommentDto,
    user: any,
  ): Promise<ReportComment> {
    await this.findOne(reportId);

    const isPM = user.role === 'PROJECT_MANAGER';
    const isMember = user.role === 'TEAM_MEMBER';
    const isAdmin = user.role === 'ADMIN';

    // If it's a reply (has parent_id), any user can reply
    // If it's a top-level comment, only PM/Admin can create
    if (!createCommentDto.parent_id && !isPM && !isAdmin) {
      throw new ForbiddenException(
        'Only Project Managers can add top-level comments. Team members can only reply.',
      );
    }

    // Validate parent comment exists if replying
    if (createCommentDto.parent_id) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parent_id, report_id: reportId },
      });

      if (!parentComment) {
        throw new BadRequestException('Parent comment not found');
      }
    }

    // ✅ FIX: Use undefined instead of null, and explicitly type the object
    const commentData: Partial<ReportComment> = {
      comment: createCommentDto.comment,
      report_id: reportId,
      user_id: user.id,
      parent_id: createCommentDto.parent_id || null,
    };

    const comment = this.commentRepository.create(commentData);
    return this.commentRepository.save(comment);
  }

  async remove(id: string, user: any): Promise<{ message: string }> {
    // Only PMs can delete
    if (user.role !== 'PROJECT_MANAGER') {
      throw new ForbiddenException('Only Project Managers can delete reports');
    }

    const report = await this.findOne(id);

    if (fs.existsSync(report.file_path)) {
      fs.unlinkSync(report.file_path);
    }

    await this.reportRepository.remove(report);
    return { message: `Report with ID ${id} successfully deleted` };
  }
}
