import { BaseQuery } from '../../common/cqrs';

export class GetTicketByIdQuery extends BaseQuery {
  constructor(
    public readonly id: string,
  ) {
    super(id);
  }
}

export class GetTicketByCodeQuery extends BaseQuery {
  constructor(
    public readonly id: string,
    public readonly code: string,
  ) {
    super(id);
  }
}

