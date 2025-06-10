import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TicketStatus {
  RESERVED = 'RESERVED',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
}

export class CreateTicketDto {
  @ApiProperty()
  @IsUUID()
  ticketTypeId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  promoterCodeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCourtesy?: boolean = false;
}

export class UpdateTicketDto {
  @ApiProperty({ enum: TicketStatus, required: false })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class BulkCreateCourtesyTicketsDto {
  @ApiProperty()
  @IsUUID()
  ticketTypeId: string;

  @ApiProperty({ type: [Object] })
  @IsArray()
  recipients: {
    name: string;
    email: string;
  }[];
}

