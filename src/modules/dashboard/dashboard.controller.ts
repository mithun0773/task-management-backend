import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.services';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard) // ✅ Only JWT guard, no RolesGuard
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(user);
  }

  @Get('task-distribution')
  getTaskDistribution(@CurrentUser() user: any) {
    return this.dashboardService.getTaskDistribution(user);
  }

  @Get('upcoming-tasks')
  getUpcomingTasks(@CurrentUser() user: any) {
    return this.dashboardService.getUpcomingTasks(user);
  }

  @Get('recent-projects')
  getRecentProjects(@CurrentUser() user: any) {
    return this.dashboardService.getRecentProjects(user);
  }

  @Get('team-workload')
  getTeamWorkload(@CurrentUser() user: any) {
    return this.dashboardService.getTeamWorkload(user);
  }

  @Get('team-stats')
  getTeamStats(@CurrentUser() user: any) {
    return this.dashboardService.getTeamStats(user);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('type') type: string,
    @CurrentUser() user: any,
  ) {
    return this.dashboardService.search(query, type, user);
  }
}
