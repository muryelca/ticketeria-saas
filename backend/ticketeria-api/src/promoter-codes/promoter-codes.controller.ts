import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromoterCodesService } from './promoter-codes.service';
import { CreatePromoterCodeDto, UpdatePromoterCodeDto } from './dto/promoter-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@ApiTags('promoter-codes')
@Controller('promoter-codes')
export class PromoterCodesController {
  constructor(private readonly promoterCodesService: PromoterCodesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROMOTER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar um novo código de promoter (admin ou promoter)' })
  create(@Body() createPromoterCodeDto: CreatePromoterCodeDto, @Request() req) {
    // Se não for especificado um promoter, usa o usuário autenticado
    if (!createPromoterCodeDto.promoterId) {
      createPromoterCodeDto.promoterId = req.user.id;
    }
    return this.promoterCodesService.create(createPromoterCodeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar códigos de promoter (usuário autenticado)' })
  findAll(@Query('promoterId') promoterId?: string, @Request() req?) {
    // Se for admin, pode ver todos os códigos ou filtrar por promoter
    // Se for promoter, só pode ver os próprios códigos
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.ORGANIZER) {
      promoterId = req.user.id;
    }
    return this.promoterCodesService.findAll(promoterId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Buscar código de promoter por código (público)' })
  findByCode(@Param('code') code: string) {
    return this.promoterCodesService.findByCode(code);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROMOTER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter estatísticas de uso dos códigos de promoter (admin ou promoter)' })
  getUsageStats(@Query('promoterId') promoterId?: string, @Request() req?) {
    // Se for admin, pode ver todas as estatísticas ou filtrar por promoter
    // Se for promoter, só pode ver as próprias estatísticas
    if (req.user.role !== UserRole.ADMIN) {
      promoterId = req.user.id;
    }
    return this.promoterCodesService.getUsageStats(promoterId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar código de promoter por ID (usuário autenticado)' })
  findOne(@Param('id') id: string) {
    return this.promoterCodesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROMOTER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar código de promoter (admin ou promoter)' })
  update(@Param('id') id: string, @Body() updatePromoterCodeDto: UpdatePromoterCodeDto) {
    return this.promoterCodesService.update(id, updatePromoterCodeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover código de promoter (apenas admin)' })
  remove(@Param('id') id: string) {
    return this.promoterCodesService.remove(id);
  }
}

