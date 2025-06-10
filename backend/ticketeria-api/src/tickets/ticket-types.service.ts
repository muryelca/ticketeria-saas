import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto/ticket-type.dto';

@Injectable()
export class TicketTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketTypeDto: CreateTicketTypeDto) {
    return this.prisma.ticketType.create({
      data: createTicketTypeDto,
      include: {
        event: true,
      },
    });
  }

  async findAll(eventId?: string) {
    const where = eventId ? { eventId } : {};
    
    return this.prisma.ticketType.findMany({
      where,
      include: {
        event: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.ticketType.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });
  }

  async update(id: string, updateTicketTypeDto: UpdateTicketTypeDto) {
    return this.prisma.ticketType.update({
      where: { id },
      data: updateTicketTypeDto,
      include: {
        event: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.ticketType.delete({
      where: { id },
    });
  }
}

