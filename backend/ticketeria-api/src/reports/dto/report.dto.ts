import { IsString, IsEnum, IsOptional, IsObject, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReportType {
  SALES = 'SALES',
  PROMOTER_CODES = 'PROMOTER_CODES',
  TICKETS = 'TICKETS',
  EVENTS = 'EVENTS',
}

export enum ReportStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class CreateReportDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}

export class ReportFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  promoterId?: string;
}

