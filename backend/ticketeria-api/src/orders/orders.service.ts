import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto, OrderStatus } from './dto/order.dto';
import { PromoterCodesService } from '../promoter-codes/promoter-codes.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private promoterCodesService: PromoterCodesService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    // Buscar os ingressos
    const tickets = await this.prisma.ticket.findMany({
      where: {
        id: { in: createOrderDto.ticketIds },
      },
      include: {
        ticketType: true,
      },
    });

    if (tickets.length !== createOrderDto.ticketIds.length) {
      throw new Error('Um ou mais ingressos não foram encontrados');
    }

    // Verificar se os ingressos estão disponíveis
    for (const ticket of tickets) {
      if (ticket.status !== 'RESERVED') {
        throw new Error(`Ingresso ${ticket.id} não está disponível`);
      }
    }

    // Calcular o valor total
    let totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

    // Aplicar código de promoter, se fornecido
    let promoterCodeId = null;
    if (createOrderDto.promoterCode) {
      const promoterCode = await this.promoterCodesService.findByCode(createOrderDto.promoterCode);
      if (promoterCode) {
        promoterCodeId = promoterCode.id;
        
        // Verificar se o código está dentro da validade
        const now = new Date();
        if (now < promoterCode.startDate || now > promoterCode.endDate) {
          throw new Error('Código de promoter fora da validade');
        }
        
        // Verificar se o código atingiu o limite de usos
        if (promoterCode.maxUses && promoterCode.currentUses >= promoterCode.maxUses) {
          throw new Error('Código de promoter atingiu o limite de usos');
        }
        
        // Aplicar desconto
        if (promoterCode.discountType === 'PERCENTAGE') {
          totalAmount = totalAmount * (1 - promoterCode.discountValue / 100);
        } else if (promoterCode.discountType === 'FIXED_AMOUNT') {
          totalAmount = Math.max(0, totalAmount - promoterCode.discountValue);
        }
        
        // Incrementar o uso do código
        await this.prisma.promoterCode.update({
          where: { id: promoterCode.id },
          data: { currentUses: { increment: 1 } },
        });
      }
    }

    // Criar o pedido
    const order = await this.prisma.order.create({
      data: {
        totalAmount,
        status: OrderStatus.PENDING,
        paymentMethod: createOrderDto.paymentMethod,
      },
    });

    // Atualizar os ingressos com o ID do pedido e o código de promoter
    for (const ticket of tickets) {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          orderId: order.id,
          promoterCodeId,
          userId,
        },
      });
    }

    return this.findOne(order.id);
  }

  async findAll(userId?: string) {
    const where: any = {};
    
    if (userId) {
      where.tickets = {
        some: {
          userId,
        },
      };
    }
    
    return this.prisma.order.findMany({
      where,
      include: {
        tickets: {
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
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        tickets: {
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
        },
      },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        tickets: {
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
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}

