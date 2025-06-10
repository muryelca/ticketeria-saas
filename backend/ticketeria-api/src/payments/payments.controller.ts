import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { 
  CreatePixPaymentDto, 
  CreateCreditCardPaymentDto,
  CreateBoletoPaymentDto,
  CreateBankTransferPaymentDto,
  CreateITPPaymentDto 
} from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('pix')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Processar pagamento via Pix (usuário autenticado)' })
  processPixPayment(@Body() createPixPaymentDto: CreatePixPaymentDto) {
    return this.paymentsService.processPixPayment(createPixPaymentDto);
  }

  @Post('credit-card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Processar pagamento via cartão de crédito (usuário autenticado)' })
  processCreditCardPayment(@Body() createCreditCardPaymentDto: CreateCreditCardPaymentDto) {
    return this.paymentsService.processCreditCardPayment(createCreditCardPaymentDto);
  }

  @Post('boleto')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Processar pagamento via boleto (usuário autenticado)' })
  processBoletoPayment(@Body() createBoletoPaymentDto: CreateBoletoPaymentDto) {
    return this.paymentsService.processBoletoPayment(createBoletoPaymentDto);
  }

  @Post('bank-transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Processar pagamento via transferência bancária (usuário autenticado)' })
  processBankTransferPayment(@Body() createBankTransferPaymentDto: CreateBankTransferPaymentDto) {
    return this.paymentsService.processBankTransferPayment(createBankTransferPaymentDto);
  }

  @Post('itp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Processar pagamento via ITP (Open Finance) (usuário autenticado)' })
  processITPPayment(@Body() createITPPaymentDto: CreateITPPaymentDto) {
    return this.paymentsService.processITPPayment(createITPPaymentDto);
  }

  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar status do pagamento (usuário autenticado)' })
  checkPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.checkPaymentStatus(orderId);
  }

  @Post('refund/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Processar reembolso (admin ou organizador)' })
  refundPayment(@Param('orderId') orderId: string) {
    return this.paymentsService.refundPayment(orderId);
  }
}

