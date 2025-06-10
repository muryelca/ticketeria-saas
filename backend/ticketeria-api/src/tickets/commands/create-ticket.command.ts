import { BaseCommand } from '../../common/cqrs';
import { CreateTicketDto } from '../dto/ticket.dto';

export class CreateTicketCommand extends BaseCommand {
  constructor(
    public readonly id: string,
    public readonly data: CreateTicketDto,
  ) {
    super(id);
  }
}

