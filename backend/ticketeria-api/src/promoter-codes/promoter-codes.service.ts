import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoterCodeDto, UpdatePromoterCodeDto } from './dto/promoter-code.dto';

@Injectable()
export class PromoterCodesService {
  constructor(private prisma: PrismaService) {}

  async create(createPromoterCodeDto: CreatePromoterCodeDto) {
    return this.prisma.promoterCode.create({
      data: createPromoterCodeDto,
      include: {
        promoter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(promoterId?: string) {
    const where = promoterId ? { promoterId } : {};
    
    return this.prisma.promoterCode.findMany({
      where,
      include: {
        promoter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.promoterCode.findUnique({
      where: { id },
      include: {
        promoter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByCode(code: string) {
    return this.prisma.promoterCode.findUnique({
      where: { code },
      include: {
        promoter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, updatePromoterCodeDto: UpdatePromoterCodeDto) {
    return this.prisma.promoterCode.update({
      where: { id },
      data: updatePromoterCodeDto,
      include: {
        promoter: {
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
    return this.prisma.promoterCode.delete({
      where: { id },
    });
  }

  async getUsageStats(promoterId?: string) {
    const where = promoterId ? { promoterId } : {};
    
    const promoterCodes = await this.prisma.promoterCode.findMany({
      where,
      include: {
        tickets: {
          select: {
            id: true,
            price: true,
            originalPrice: true,
            status: true,
          },
        },
        promoter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return promoterCodes.map(code => {
      const totalTickets = code.tickets.length;
      const totalDiscount = code.tickets.reduce((sum, ticket) => {
        return sum + (ticket.originalPrice - ticket.price);
      }, 0);
      
      return {
        id: code.id,
        code: code.code,
        promoter: code.promoter,
        discountType: code.discountType,
        discountValue: code.discountValue,
        startDate: code.startDate,
        endDate: code.endDate,
        maxUses: code.maxUses,
        currentUses: code.currentUses,
        totalTickets,
        totalDiscount,
      };
    });
  }
}

