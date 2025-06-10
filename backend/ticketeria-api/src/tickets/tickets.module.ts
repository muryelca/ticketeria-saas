import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketTypesService } from './ticket-types.service';
import { TicketTypesController } from './ticket-types.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagingModule } from '../messaging/messaging.module';

// CQRS
import { CreateTicketHandler } from './handlers/create-ticket.handler';
import { GetTicketByIdHandler, GetTicketByCodeHandler } from './handlers/get-ticket.handler';
import { TicketCreatedHandler } from './handlers/ticket-created.handler';

const CommandHandlers = [CreateTicketHandler];
const QueryHandlers = [GetTicketByIdHandler, GetTicketByCodeHandler];
const EventHandlers = [TicketCreatedHandler];

@Module({
  imports: [PrismaModule, CqrsModule, MessagingModule],
  controllers: [TicketsController, TicketTypesController],
  providers: [
    TicketsService,
    TicketTypesService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [TicketsService, TicketTypesService],
})
export class TicketsModule {}

