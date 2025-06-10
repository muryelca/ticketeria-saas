import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto, ReportFilterDto, ReportType, ReportStatus } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        name: createReportDto.name,
        type: createReportDto.type,
        parameters: createReportDto.parameters || {},
        status: ReportStatus.PROCESSING,
      },
    });
  }

  async findAll() {
    return this.prisma.report.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
    });
  }

  async generateSalesReport(filters: ReportFilterDto = {}) {
    // Construir a query com os filtros
    const where: any = {};
    
    if (filters.startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(filters.startDate),
      };
    }
    
    if (filters.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.endDate),
      };
    }
    
    // Buscar os pedidos
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'PAID',
        ...where,
      },
      include: {
        tickets: {
          include: {
            ticketType: {
              include: {
                event: true,
              },
            },
            promoterCode: {
              include: {
                promoter: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Processar os dados para o relatório
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const totalTickets = orders.reduce((sum, order) => sum + order.tickets.length, 0);
    
    // Agrupar por evento
    const salesByEvent = {};
    for (const order of orders) {
      for (const ticket of order.tickets) {
        const eventId = ticket.ticketType.eventId;
        const eventName = ticket.ticketType.event.title;
        
        if (!salesByEvent[eventId]) {
          salesByEvent[eventId] = {
            eventId,
            eventName,
            totalSales: 0,
            totalTickets: 0,
          };
        }
        
        salesByEvent[eventId].totalSales += ticket.price;
        salesByEvent[eventId].totalTickets += 1;
      }
    }
    
    // Agrupar por promoter
    const salesByPromoter = {};
    for (const order of orders) {
      for (const ticket of order.tickets) {
        if (ticket.promoterCode) {
          const promoterId = ticket.promoterCode.promoterId;
          const promoterName = ticket.promoterCode.promoter.name;
          
          if (!salesByPromoter[promoterId]) {
            salesByPromoter[promoterId] = {
              promoterId,
              promoterName,
              totalSales: 0,
              totalTickets: 0,
              totalDiscount: 0,
            };
          }
          
          salesByPromoter[promoterId].totalSales += ticket.price;
          salesByPromoter[promoterId].totalTickets += 1;
          salesByPromoter[promoterId].totalDiscount += (ticket.originalPrice - ticket.price);
        }
      }
    }
    
    return {
      summary: {
        totalSales,
        totalOrders,
        totalTickets,
        period: {
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      },
      salesByEvent: Object.values(salesByEvent),
      salesByPromoter: Object.values(salesByPromoter),
      orders,
    };
  }

  async generatePromoterCodesReport(filters: ReportFilterDto = {}) {
    // Construir a query com os filtros
    const where: any = {};
    
    if (filters.promoterId) {
      where.promoterId = filters.promoterId;
    }
    
    // Buscar os códigos de promoter
    const promoterCodes = await this.prisma.promoterCode.findMany({
      where,
      include: {
        promoter: true,
        tickets: {
          include: {
            ticketType: {
              include: {
                event: true,
              },
            },
            order: true,
          },
        },
      },
    });
    
    // Processar os dados para o relatório
    const codesData = promoterCodes.map(code => {
      const totalTickets = code.tickets.length;
      const totalDiscount = code.tickets.reduce((sum, ticket) => {
        return sum + (ticket.originalPrice - ticket.price);
      }, 0);
      const totalSales = code.tickets.reduce((sum, ticket) => {
        return sum + ticket.price;
      }, 0);
      
      // Agrupar por evento
      const ticketsByEvent = {};
      for (const ticket of code.tickets) {
        const eventId = ticket.ticketType.eventId;
        const eventName = ticket.ticketType.event.title;
        
        if (!ticketsByEvent[eventId]) {
          ticketsByEvent[eventId] = {
            eventId,
            eventName,
            totalTickets: 0,
            totalDiscount: 0,
            totalSales: 0,
          };
        }
        
        ticketsByEvent[eventId].totalTickets += 1;
        ticketsByEvent[eventId].totalDiscount += (ticket.originalPrice - ticket.price);
        ticketsByEvent[eventId].totalSales += ticket.price;
      }
      
      return {
        id: code.id,
        code: code.code,
        promoter: {
          id: code.promoter.id,
          name: code.promoter.name,
          email: code.promoter.email,
        },
        discountType: code.discountType,
        discountValue: code.discountValue,
        startDate: code.startDate,
        endDate: code.endDate,
        maxUses: code.maxUses,
        currentUses: code.currentUses,
        totalTickets,
        totalDiscount,
        totalSales,
        ticketsByEvent: Object.values(ticketsByEvent),
      };
    });
    
    return {
      totalCodes: codesData.length,
      totalTickets: codesData.reduce((sum, code) => sum + code.totalTickets, 0),
      totalDiscount: codesData.reduce((sum, code) => sum + code.totalDiscount, 0),
      totalSales: codesData.reduce((sum, code) => sum + code.totalSales, 0),
      codes: codesData,
    };
  }

  async generateTicketsReport(filters: ReportFilterDto = {}) {
    // Construir a query com os filtros
    const where: any = {};
    
    if (filters.eventId) {
      where.ticketType = {
        eventId: filters.eventId,
      };
    }
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }
    
    // Buscar os ingressos
    const tickets = await this.prisma.ticket.findMany({
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
        promoterCode: {
          include: {
            promoter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Processar os dados para o relatório
    const totalTickets = tickets.length;
    const totalSales = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const totalOriginalValue = tickets.reduce((sum, ticket) => sum + ticket.originalPrice, 0);
    const totalDiscount = totalOriginalValue - totalSales;
    
    // Agrupar por status
    const ticketsByStatus = {};
    for (const ticket of tickets) {
      if (!ticketsByStatus[ticket.status]) {
        ticketsByStatus[ticket.status] = {
          status: ticket.status,
          count: 0,
          totalValue: 0,
        };
      }
      
      ticketsByStatus[ticket.status].count += 1;
      ticketsByStatus[ticket.status].totalValue += ticket.price;
    }
    
    // Agrupar por tipo de ingresso
    const ticketsByType = {};
    for (const ticket of tickets) {
      const typeId = ticket.ticketTypeId;
      const typeName = ticket.ticketType.name;
      
      if (!ticketsByType[typeId]) {
        ticketsByType[typeId] = {
          typeId,
          typeName,
          count: 0,
          totalValue: 0,
        };
      }
      
      ticketsByType[typeId].count += 1;
      ticketsByType[typeId].totalValue += ticket.price;
    }
    
    // Agrupar por evento
    const ticketsByEvent = {};
    for (const ticket of tickets) {
      const eventId = ticket.ticketType.eventId;
      const eventName = ticket.ticketType.event.title;
      
      if (!ticketsByEvent[eventId]) {
        ticketsByEvent[eventId] = {
          eventId,
          eventName,
          count: 0,
          totalValue: 0,
        };
      }
      
      ticketsByEvent[eventId].count += 1;
      ticketsByEvent[eventId].totalValue += ticket.price;
    }
    
    return {
      summary: {
        totalTickets,
        totalSales,
        totalOriginalValue,
        totalDiscount,
        period: {
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      },
      ticketsByStatus: Object.values(ticketsByStatus),
      ticketsByType: Object.values(ticketsByType),
      ticketsByEvent: Object.values(ticketsByEvent),
      tickets,
    };
  }

  async generateEventsReport(filters: ReportFilterDto = {}) {
    // Construir a query com os filtros
    const where: any = {};
    
    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      
      if (filters.startDate) {
        where.startDate.gte = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        where.startDate.lte = new Date(filters.endDate);
      }
    }
    
    // Buscar os eventos
    const events = await this.prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketTypes: {
          include: {
            tickets: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    
    // Processar os dados para o relatório
    const eventsData = events.map(event => {
      const ticketTypes = event.ticketTypes.map(type => {
        const soldTickets = type.tickets.filter(ticket => ticket.status === 'PAID').length;
        const reservedTickets = type.tickets.filter(ticket => ticket.status === 'RESERVED').length;
        const canceledTickets = type.tickets.filter(ticket => ticket.status === 'CANCELED').length;
        const usedTickets = type.tickets.filter(ticket => ticket.status === 'USED').length;
        const expiredTickets = type.tickets.filter(ticket => ticket.status === 'EXPIRED').length;
        
        const totalSales = type.tickets
          .filter(ticket => ticket.status === 'PAID')
          .reduce((sum, ticket) => sum + ticket.price, 0);
        
        return {
          id: type.id,
          name: type.name,
          price: type.price,
          quantity: type.quantity,
          soldTickets,
          reservedTickets,
          canceledTickets,
          usedTickets,
          expiredTickets,
          totalSales,
          occupancyRate: (soldTickets / type.quantity) * 100,
        };
      });
      
      const totalTickets = event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
      const soldTickets = event.ticketTypes.reduce((sum, type) => {
        return sum + type.tickets.filter(ticket => ticket.status === 'PAID').length;
      }, 0);
      
      const totalSales = event.ticketTypes.reduce((sum, type) => {
        return sum + type.tickets
          .filter(ticket => ticket.status === 'PAID')
          .reduce((ticketSum, ticket) => ticketSum + ticket.price, 0);
      }, 0);
      
      return {
        id: event.id,
        title: event.title,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        organizer: event.organizer,
        ticketTypes,
        totalTickets,
        soldTickets,
        occupancyRate: (soldTickets / totalTickets) * 100,
        totalSales,
      };
    });
    
    return {
      totalEvents: eventsData.length,
      totalTickets: eventsData.reduce((sum, event) => sum + event.totalTickets, 0),
      soldTickets: eventsData.reduce((sum, event) => sum + event.soldTickets, 0),
      totalSales: eventsData.reduce((sum, event) => sum + event.totalSales, 0),
      events: eventsData,
    };
  }

  async generateReport(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });
    
    if (!report) {
      throw new Error('Relatório não encontrado');
    }
    
    try {
      let result;
      const parameters = report.parameters as ReportFilterDto;
      
      switch (report.type) {
        case ReportType.SALES:
          result = await this.generateSalesReport(parameters);
          break;
        case ReportType.PROMOTER_CODES:
          result = await this.generatePromoterCodesReport(parameters);
          break;
        case ReportType.TICKETS:
          result = await this.generateTicketsReport(parameters);
          break;
        case ReportType.EVENTS:
          result = await this.generateEventsReport(parameters);
          break;
        default:
          throw new Error('Tipo de relatório não suportado');
      }
      
      // Atualizar o status do relatório
      await this.prisma.report.update({
        where: { id },
        data: {
          status: ReportStatus.COMPLETED,
          // Na prática, aqui seria gerado um arquivo e o URL seria salvo
          // fileUrl: 'https://example.com/reports/report-123.pdf',
        },
      });
      
      return result;
    } catch (error) {
      // Em caso de erro, atualizar o status do relatório
      await this.prisma.report.update({
        where: { id },
        data: {
          status: ReportStatus.FAILED,
        },
      });
      
      throw error;
    }
  }
}

