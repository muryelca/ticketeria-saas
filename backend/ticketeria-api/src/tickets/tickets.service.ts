import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto, BulkCreateCourtesyTicketsDto } from './dto/ticket.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto) {
    // Buscar o tipo de ingresso para obter o preço
    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id: createTicketDto.ticketTypeId },
    });

    if (!ticketType) {
      throw new Error('Tipo de ingresso não encontrado');
    }

    let price = ticketType.price;
    let originalPrice = ticketType.price;

    // Se houver código de promoter, aplicar desconto
    if (createTicketDto.promoterCodeId) {
      const promoterCode = await this.prisma.promoterCode.findUnique({
        where: { id: createTicketDto.promoterCodeId },
      });

      if (promoterCode) {
        if (promoterCode.discountType === 'PERCENTAGE') {
          price = originalPrice * (1 - promoterCode.discountValue / 100);
        } else if (promoterCode.discountType === 'FIXED_AMOUNT') {
          price = Math.max(0, originalPrice - promoterCode.discountValue);
        }

        // Incrementar o uso do código
        await this.prisma.promoterCode.update({
          where: { id: createTicketDto.promoterCodeId },
          data: { currentUses: { increment: 1 } },
        });
      }
    }

    // Se for cortesia, preço é zero
    if (createTicketDto.isCourtesy) {
      price = 0;
    }

    return this.prisma.ticket.create({
      data: {
        code: uuidv4(),
        price,
        originalPrice,
        isCourtesy: createTicketDto.isCourtesy || false,
        ticketType: {
          connect: { id: createTicketDto.ticketTypeId },
        },
        user: createTicketDto.userId
          ? { connect: { id: createTicketDto.userId } }
          : undefined,
        promoterCode: createTicketDto.promoterCodeId
          ? { connect: { id: createTicketDto.promoterCodeId } }
          : undefined,
      },
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

  async bulkCreateCourtesy(data: BulkCreateCourtesyTicketsDto) {
    // Implementação para criar ingressos cortesia em lote
    // Esta é uma versão simplificada, na prática seria integrado com o módulo de mensageria

    const results = [];

    for (const recipient of data.recipients) {
      // Verificar se o usuário já existe ou criar um novo
      let user = await this.prisma.user.findUnique({
        where: { email: recipient.email },
      });

      user ??= await this.prisma.user.create({
        data: {
          name: recipient.name,
          email: recipient.email,
          password: uuidv4(), // Senha aleatória, na prática enviaria um link para definir senha
        },
      });

      // Criar o ingresso cortesia
      const ticket = await this.create({
        ticketTypeId: data.ticketTypeId,
        userId: user.id,
        isCourtesy: true,
      });

      results.push(ticket as unknown as never);
    }

    return results;
  }

  async findAll(userId?: string, eventId?: string) {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (eventId) {
      where.ticketType = {
        eventId,
      };
    }

    return this.prisma.ticket.findMany({
      where,
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

  async findOne(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
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

  async findByCode(code: string) {
    return this.prisma.ticket.findUnique({
      where: { code },
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

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    return this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto,
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

  async remove(id: string) {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }
}

