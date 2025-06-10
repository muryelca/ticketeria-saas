import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard() {
    // Total de vendas
    const totalSales = await this.prisma.order.aggregate({
      where: {
        status: 'PAID',
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Total de ingressos vendidos
    const totalTicketsSold = await this.prisma.ticket.count({
      where: {
        status: 'PAID',
      },
    });

    // Total de eventos
    const totalEvents = await this.prisma.event.count();

    // Total de usuários
    const totalUsers = await this.prisma.user.count();

    // Vendas por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesByMonth = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("totalAmount") as total
      FROM "orders"
      WHERE "status" = 'PAID' AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // Eventos mais vendidos
    const topEvents = await this.prisma.event.findMany({
      take: 5,
      include: {
        ticketTypes: {
          include: {
            tickets: {
              where: {
                status: 'PAID',
              },
            },
          },
        },
      },
      orderBy: {
        ticketTypes: {
          _count: 'desc',
        },
      },
    });

    const formattedTopEvents = topEvents.map(event => {
      const ticketsSold = event.ticketTypes.reduce((sum, type) => {
        return sum + type.tickets.length;
      }, 0);

      const totalSales = event.ticketTypes.reduce((sum, type) => {
        return sum + type.tickets.reduce((ticketSum, ticket) => {
          return ticketSum + ticket.price;
        }, 0);
      }, 0);

      return {
        id: event.id,
        title: event.title,
        ticketsSold,
        totalSales,
      };
    });

    // Promoters mais ativos
    const topPromoters = await this.prisma.user.findMany({
      where: {
        role: 'PROMOTER',
      },
      take: 5,
      include: {
        promoterCodes: {
          include: {
            tickets: {
              where: {
                status: 'PAID',
              },
            },
          },
        },
      },
      orderBy: {
        promoterCodes: {
          _count: 'desc',
        },
      },
    });

    const formattedTopPromoters = topPromoters.map(promoter => {
      const ticketsSold = promoter.promoterCodes.reduce((sum, code) => {
        return sum + code.tickets.length;
      }, 0);

      const totalSales = promoter.promoterCodes.reduce((sum, code) => {
        return sum + code.tickets.reduce((ticketSum, ticket) => {
          return ticketSum + ticket.price;
        }, 0);
      }, 0);

      return {
        id: promoter.id,
        name: promoter.name,
        email: promoter.email,
        ticketsSold,
        totalSales,
      };
    });

    return {
      summary: {
        totalSales: totalSales._sum.totalAmount || 0,
        totalTicketsSold,
        totalEvents,
        totalUsers,
      },
      salesByMonth,
      topEvents: formattedTopEvents,
      topPromoters: formattedTopPromoters,
    };
  }

  async getOrganizerDashboard(organizerId: string) {
    // Total de vendas dos eventos do organizador
    const events = await this.prisma.event.findMany({
      where: {
        organizerId,
      },
      include: {
        ticketTypes: {
          include: {
            tickets: {
              where: {
                status: 'PAID',
              },
            },
          },
        },
      },
    });

    const totalSales = events.reduce((sum, event) => {
      return sum + event.ticketTypes.reduce((typeSum, type) => {
        return typeSum + type.tickets.reduce((ticketSum, ticket) => {
          return ticketSum + ticket.price;
        }, 0);
      }, 0);
    }, 0);

    const totalTicketsSold = events.reduce((sum, event) => {
      return sum + event.ticketTypes.reduce((typeSum, type) => {
        return typeSum + type.tickets.length;
      }, 0);
    }, 0);

    // Total de eventos do organizador
    const totalEvents = events.length;

    // Vendas por evento
    const salesByEvent = events.map(event => {
      const ticketsSold = event.ticketTypes.reduce((sum, type) => {
        return sum + type.tickets.length;
      }, 0);

      const totalEventSales = event.ticketTypes.reduce((sum, type) => {
        return sum + type.tickets.reduce((ticketSum, ticket) => {
          return ticketSum + ticket.price;
        }, 0);
      }, 0);

      return {
        id: event.id,
        title: event.title,
        ticketsSold,
        totalSales: totalEventSales,
      };
    });

    // Vendas por tipo de ingresso
    const ticketTypes = events.flatMap(event => event.ticketTypes);
    const salesByTicketType = ticketTypes.map(type => {
      const ticketsSold = type.tickets.length;
      const totalTypeSales = type.tickets.reduce((sum, ticket) => {
        return sum + ticket.price;
      }, 0);

      return {
        id: type.id,
        name: type.name,
        eventId: type.eventId,
        eventTitle: events.find(e => e.id === type.eventId).title,
        ticketsSold,
        totalSales: totalTypeSales,
      };
    });

    return {
      summary: {
        totalSales,
        totalTicketsSold,
        totalEvents,
      },
      salesByEvent,
      salesByTicketType,
    };
  }

  async getPromoterDashboard(promoterId: string) {
    // Buscar códigos de promoter
    const promoterCodes = await this.prisma.promoterCode.findMany({
      where: {
        promoterId,
      },
      include: {
        tickets: {
          include: {
            ticketType: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    });

    // Total de vendas com os códigos do promoter
    const totalSales = promoterCodes.reduce((sum, code) => {
      return sum + code.tickets.reduce((ticketSum, ticket) => {
        return ticketSum + ticket.price;
      }, 0);
    }, 0);

    // Total de ingressos vendidos com os códigos do promoter
    const totalTicketsSold = promoterCodes.reduce((sum, code) => {
      return sum + code.tickets.length;
    }, 0);

    // Total de desconto gerado
    const totalDiscount = promoterCodes.reduce((sum, code) => {
      return sum + code.tickets.reduce((ticketSum, ticket) => {
        return ticketSum + (ticket.originalPrice - ticket.price);
      }, 0);
    }, 0);

    // Vendas por código
    const salesByCode = promoterCodes.map(code => {
      const ticketsSold = code.tickets.length;
      const totalCodeSales = code.tickets.reduce((sum, ticket) => {
        return sum + ticket.price;
      }, 0);
      const totalCodeDiscount = code.tickets.reduce((sum, ticket) => {
        return sum + (ticket.originalPrice - ticket.price);
      }, 0);

      return {
        id: code.id,
        code: code.code,
        discountType: code.discountType,
        discountValue: code.discountValue,
        ticketsSold,
        totalSales: totalCodeSales,
        totalDiscount: totalCodeDiscount,
      };
    });

    // Vendas por evento
    const eventMap = {};
    for (const code of promoterCodes) {
      for (const ticket of code.tickets) {
        const eventId = ticket.ticketType.eventId;
        const eventTitle = ticket.ticketType.event.title;

        if (!eventMap[eventId]) {
          eventMap[eventId] = {
            id: eventId,
            title: eventTitle,
            ticketsSold: 0,
            totalSales: 0,
            totalDiscount: 0,
          };
        }

        eventMap[eventId].ticketsSold += 1;
        eventMap[eventId].totalSales += ticket.price;
        eventMap[eventId].totalDiscount += (ticket.originalPrice - ticket.price);
      }
    }

    return {
      summary: {
        totalSales,
        totalTicketsSold,
        totalDiscount,
        totalCodes: promoterCodes.length,
      },
      salesByCode,
      salesByEvent: Object.values(eventMap),
    };
  }
}

