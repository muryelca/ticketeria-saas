import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../orders/dto/order.dto';

export class CreatePixPaymentDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requireCpf?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  enableSplit?: boolean;
}

export class CreateCreditCardPaymentDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty()
  @IsString()
  cardNumber: string;

  @ApiProperty()
  @IsString()
  cardholderName: string;

  @ApiProperty()
  @IsString()
  expirationDate: string;

  @ApiProperty()
  @IsString()
  cvv: string;

  @ApiProperty()
  @IsNumber()
  installments: number;
}

export class CreateBoletoPaymentDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;
}

export class CreateBankTransferPaymentDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiProperty()
  @IsString()
  email: string;
}

export class CreateITPPaymentDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  bank: string;
}

export class PaymentResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  paymentId: string;

  @ApiProperty()
  paymentUrl?: string;

  @ApiProperty()
  qrCode?: string;

  @ApiProperty()
  barCode?: string;

  @ApiProperty()
  message?: string;
}

