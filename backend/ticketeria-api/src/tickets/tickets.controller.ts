import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto, BulkCreateCourtesyTicketsDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';
import { v4 as uuidv4 } from 'uuid';

// CQRS
import { CreateTicketCommand } from './commands/create-ticket.command';
import { GetTicketByIdQuery, GetTicketByCodeQuery } from './queries/get-ticket.query';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar um novo ingresso (usuário autenticado)' })
  async create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    // Se não for especificado um usuário, usa o usuário autenticado
    if (!createTicketDto.userId) {
      createTicketDto.userId = req.user.id;
    }
    
    // Usando CQRS para criar o ingresso
    return this.commandBus.execute(
      new CreateTicketCommand(uuidv4(), createTicketDto)
    );
  }

  @Post('courtesy/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar ingressos cortesia em lote (admin ou organizador)' })
  bulkCreateCourtesy(@Body() bulkCreateDto: BulkCreateCourtesyTicketsDto) {
    return this.ticketsService.bulkCreateCourtesy(bulkCreateDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar ingressos (usuário autenticado)' })
  findAll(@Query('userId') userId?: string, @Query('eventId') eventId?: string, @Request() req?) {
    // Se for admin, pode ver todos os ingressos ou filtrar por usuário
    // Se não for admin, só pode ver os próprios ingressos
    if (req.user.role !== UserRole.ADMIN && userId !== req.user.id) {
      userId = req.user.id;
    }
    return this.ticketsService.findAll(userId, eventId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Buscar ingresso por código (público)' })
  findByCode(@Param('code') code: string) {
    // Usando CQRS para buscar o ingresso por código
    return this.queryBus.execute(
      new GetTicketByCodeQuery(uuidv4(), code)
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar ingresso por ID (usuário autenticado)' })
  findOne(@Param('id') id: string) {
    // Usando CQRS para buscar o ingresso por ID
    return this.queryBus.execute(
      new GetTicketByIdQuery(id)
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar ingresso (admin ou organizador)' })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover ingresso (apenas admin)' })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}

