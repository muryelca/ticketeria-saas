import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto, EventFilterDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, organizerId: string) {
    return this.prisma.event.create({
      data: {
        ...createEventDto,
        organizer: {
          connect: { id: organizerId },
        },
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(filters: EventFilterDto = {}) {
    const where = {};
    
    if (filters.title) {
      where['title'] = { contains: filters.title, mode: 'insensitive' };
    }
    
    if (filters.location) {
      where['location'] = { contains: filters.location, mode: 'insensitive' };
    }
    
    if (filters.status) {
      where['status'] = filters.status;
    }
    
    if (filters.organizerId) {
      where['organizerId'] = filters.organizerId;
    }
    
    if (filters.startDate) {
      where['startDate'] = { gte: new Date(filters.startDate) };
    }
    
    if (filters.endDate) {
      where['endDate'] = { lte: new Date(filters.endDate) };
    }
    
    return this.prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketTypes: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketTypes: true,
      },
    });
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.event.delete({
      where: { id },
    });
  }
}

