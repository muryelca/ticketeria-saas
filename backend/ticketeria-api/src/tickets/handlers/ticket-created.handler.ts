import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TicketCreatedEvent } from '../events/ticket-created.event';
import { MessagingService } from '../../messaging/messaging.service';
import { PrismaService } from '../../prisma/prisma.service';

@EventsHandler(TicketCreatedEvent)
export class TicketCreatedHandler implements IEventHandler<TicketCreatedEvent> {
  constructor(
    private messagingService: MessagingService,
    private prisma: PrismaService,
  ) {}

  async handle(event: TicketCreatedEvent) {
    // Buscar informações detalhadas do ingresso
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: event.ticketId },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
        user: true,
      },
    });

    if (!ticket || !ticket.user) {
      return;
    }

    // Enviar email de confirmação
    await this.messagingService.sendEmailNotification({
      to: ticket.user.email,
      subject: `Seu ingresso para ${ticket.ticketType.event.title} foi criado!`,
      template: 'ticket-created',
      data: {
        userName: ticket.user.name,
        eventName: ticket.ticketType.event.title,
        eventDate: ticket.ticketType.event.startDate,
        ticketType: ticket.ticketType.name,
        isCourtesy: event.isCourtesy,
      },
    });

    // Registrar atividade para análise
    console.log(`Ingresso ${event.ticketId} criado para o usuário ${event.userId} no evento ${event.eventId}`);
  }
}

