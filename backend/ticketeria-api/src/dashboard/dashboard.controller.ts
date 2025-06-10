import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obter dados do dashboard administrativo (apenas admin)' })
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('organizer')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Obter dados do dashboard de organizador (admin ou organizador)' })
  getOrganizerDashboard(@Request() req) {
    // Se for admin, pode ver o dashboard de qualquer organizador
    // Se for organizador, só pode ver o próprio dashboard
    const organizerId = req.user.role === UserRole.ADMIN ? req.query.organizerId : req.user.id;
    return this.dashboardService.getOrganizerDashboard(organizerId);
  }

  @Get('promoter')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROMOTER)
  @ApiOperation({ summary: 'Obter dados do dashboard de promoter (admin ou promoter)' })
  getPromoterDashboard(@Request() req) {
    // Se for admin, pode ver o dashboard de qualquer promoter
    // Se for promoter, só pode ver o próprio dashboard
    const promoterId = req.user.role === UserRole.ADMIN ? req.query.promoterId : req.user.id;
    return this.dashboardService.getPromoterDashboard(promoterId);
  }
}

