import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto/ticket-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@ApiTags('ticket-types')
@Controller('ticket-types')
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar um novo tipo de ingresso (admin ou organizador)' })
  create(@Body() createTicketTypeDto: CreateTicketTypeDto) {
    return this.ticketTypesService.create(createTicketTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os tipos de ingressos (público)' })
  findAll(@Query('eventId') eventId?: string) {
    return this.ticketTypesService.findAll(eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tipo de ingresso por ID (público)' })
  findOne(@Param('id') id: string) {
    return this.ticketTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar tipo de ingresso (admin ou organizador)' })
  update(@Param('id') id: string, @Body() updateTicketTypeDto: UpdateTicketTypeDto) {
    return this.ticketTypesService.update(id, updateTicketTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover tipo de ingresso (admin ou organizador)' })
  remove(@Param('id') id: string) {
    return this.ticketTypesService.remove(id);
  }
}

