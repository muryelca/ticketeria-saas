import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto, ReportFilterDto, ReportType } from './dto/report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ORGANIZER)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo relatório (admin ou organizador)' })
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os relatórios (admin ou organizador)' })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('sales')
  @ApiOperation({ summary: 'Gerar relatório de vendas (admin ou organizador)' })
  generateSalesReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.generateSalesReport(filters);
  }

  @Get('promoter-codes')
  @ApiOperation({ summary: 'Gerar relatório de códigos de promoter (admin ou organizador)' })
  generatePromoterCodesReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.generatePromoterCodesReport(filters);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Gerar relatório de ingressos (admin ou organizador)' })
  generateTicketsReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.generateTicketsReport(filters);
  }

  @Get('events')
  @ApiOperation({ summary: 'Gerar relatório de eventos (admin ou organizador)' })
  generateEventsReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.generateEventsReport(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar relatório por ID (admin ou organizador)' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Gerar relatório (admin ou organizador)' })
  generateReport(@Param('id') id: string) {
    return this.reportsService.generateReport(id);
  }
}

