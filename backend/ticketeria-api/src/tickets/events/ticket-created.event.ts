import { BaseEvent } from '../../common/cqrs';

export class TicketCreatedEvent extends BaseEvent {
  constructor(
    public readonly id: string,
    public readonly ticketId: string,
    public readonly userId: string,
    public readonly eventId: string,
    public readonly isCourtesy: boolean,
  ) {
    super(id);
  }
}

