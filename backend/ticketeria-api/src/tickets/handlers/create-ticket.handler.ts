import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTicketCommand } from '../commands/create-ticket.command';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { MessagingService } from '../../messaging/messaging.service';

@CommandHandler(CreateTicketCommand)
export class CreateTicketHandler implements ICommandHandler<CreateTicketCommand> {
  constructor(
    private prisma: PrismaService,
    private messagingService: MessagingService,
  ) {}

  async execute(command: CreateTicketCommand): Promise<any> {
    const { data } = command;

    // Buscar o tipo de ingresso para obter o preço
    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id: data.ticketTypeId },
    });

    if (!ticketType) {
      throw new Error('Tipo de ingresso não encontrado');
    }

    let price = ticketType.price;
    let originalPrice = ticketType.price;

    // Se houver código de promoter, aplicar desconto
    if (data.promoterCodeId) {
      const promoterCode = await this.prisma.promoterCode.findUnique({
        where: { id: data.promoterCodeId },
      });

      if (promoterCode) {
        if (promoterCode.discountType === 'PERCENTAGE') {
          price = originalPrice * (1 - promoterCode.discountValue / 100);
        } else if (promoterCode.discountType === 'FIXED_AMOUNT') {
          price = Math.max(0, originalPrice - promoterCode.discountValue);
        }

        // Incrementar o uso do código
        await this.prisma.promoterCode.update({
          where: { id: data.promoterCodeId },
          data: { currentUses: { increment: 1 } },
        });
      }
    }

    // Se for cortesia, preço é zero
    if (data.isCourtesy) {
      price = 0;
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        code: uuidv4(),
        price,
        originalPrice,
        isCourtesy: data.isCourtesy || false,
        ticketType: {
          connect: { id: data.ticketTypeId },
        },
        user: data.userId
          ? { connect: { id: data.userId } }
          : undefined,
        promoterCode: data.promoterCodeId
          ? { connect: { id: data.promoterCodeId } }
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

    // Enviar mensagem para gerar o ingresso físico/digital
    if (ticket.user) {
      await this.messagingService.sendTicketGeneration({
        ticketId: ticket.id,
        ticketCode: ticket.code,
        eventName: ticket.ticketType.event.title,
        eventDate: ticket.ticketType.event.startDate,
        eventLocation: ticket.ticketType.event.location,
        ticketType: ticket.ticketType.name,
        userName: ticket.user.name,
        userEmail: ticket.user.email,
      });

      // Enviar notificação por email
      await this.messagingService.sendEmailNotification({
        to: ticket.user.email,
        subject: `Seu ingresso para ${ticket.ticketType.event.title}`,
        template: 'ticket-confirmation',
        data: {
          userName: ticket.user.name,
          eventName: ticket.ticketType.event.title,
          eventDate: ticket.ticketType.event.startDate,
          eventLocation: ticket.ticketType.event.location,
          ticketType: ticket.ticketType.name,
          ticketCode: ticket.code,
        },
      });
    }

    return ticket;
  }
}

