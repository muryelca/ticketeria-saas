import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTicketByIdQuery, GetTicketByCodeQuery } from '../queries/get-ticket.query';
import { PrismaService } from '../../prisma/prisma.service';

@QueryHandler(GetTicketByIdQuery)
export class GetTicketByIdHandler implements IQueryHandler<GetTicketByIdQuery> {
  constructor(private prisma: PrismaService) {}

  async execute(query: GetTicketByIdQuery): Promise<any> {
    return this.prisma.ticket.findUnique({
      where: { id: query.id },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        promoterCode: true,
      },
    });
  }
}

@QueryHandler(GetTicketByCodeQuery)
export class GetTicketByCodeHandler implements IQueryHandler<GetTicketByCodeQuery> {
  constructor(private prisma: PrismaService) {}

  async execute(query: GetTicketByCodeQuery): Promise<any> {
    return this.prisma.ticket.findUnique({
      where: { code: query.code },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        promoterCode: true,
      },
    });
  }
}

