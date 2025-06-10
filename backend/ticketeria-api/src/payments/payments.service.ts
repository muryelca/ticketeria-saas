import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { SqalaService } from './sqala.service';
import { 
  CreatePixPaymentDto, 
  CreateCreditCardPaymentDto,
  CreateBoletoPaymentDto,
  CreateBankTransferPaymentDto,
  CreateITPPaymentDto,
  PaymentResponseDto 
} from './dto/payment.dto';
import { OrderStatus } from '../orders/dto/order.dto';
import { TicketStatus } from '../tickets/dto/ticket.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private sqalaService: SqalaService,
  ) {}

  async processPixPayment(data: CreatePixPaymentDto): Promise<PaymentResponseDto> {
    // Buscar o pedido
    const order = await this.ordersService.findOne(data.orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Verificar se o pedido já foi pago
    if (order.status === OrderStatus.PAID) {
      throw new Error('Pedido já foi pago');
    }

    // Processar o pagamento
    const paymentResponse = await this.sqalaService.createPixPayment(data, order.totalAmount);

    if (paymentResponse.success) {
      // Atualizar o pedido com o ID do pagamento
      await this.ordersService.update(order.id, {
        paymentId: paymentResponse.paymentId,
      });
    }

    return paymentResponse;
  }

  async processCreditCardPayment(data: CreateCreditCardPaymentDto): Promise<PaymentResponseDto> {
    // Buscar o pedido
    const order = await this.ordersService.findOne(data.orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Verificar se o pedido já foi pago
    if (order.status === OrderStatus.PAID) {
      throw new Error('Pedido já foi pago');
    }

    // Processar o pagamento
    const paymentResponse = await this.sqalaService.createCreditCardPayment(data, order.totalAmount);

    if (paymentResponse.success) {
      // Atualizar o pedido com o ID do pagamento
      await this.ordersService.update(order.id, {
        paymentId: paymentResponse.paymentId,
        status: OrderStatus.PAID, // Pagamento com cartão é aprovado imediatamente
      });

      // Atualizar o status dos ingressos
      for (const ticket of order.tickets) {
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: TicketStatus.PAID },
        });
      }
    }

    return paymentResponse;
  }

  async processBoletoPayment(data: CreateBoletoPaymentDto): Promise<PaymentResponseDto> {
    // Buscar o pedido
    const order = await this.ordersService.findOne(data.orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Verificar se o pedido já foi pago
    if (order.status === OrderStatus.PAID) {
      throw new Error('Pedido já foi pago');
    }

    // Processar o pagamento
    const paymentResponse = await this.sqalaService.createBoletoPayment(data, order.totalAmount);

    if (paymentResponse.success) {
      // Atualizar o pedido com o ID do pagamento
      await this.ordersService.update(order.id, {
        paymentId: paymentResponse.paymentId,
      });
    }

    return paymentResponse;
  }

  async processBankTransferPayment(data: CreateBankTransferPaymentDto): Promise<PaymentResponseDto> {
    // Buscar o pedido
    const order = await this.ordersService.findOne(data.orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Verificar se o pedido já foi pago
    if (order.status === OrderStatus.PAID) {
      throw new Error('Pedido já foi pago');
    }

    // Processar o pagamento
    const paymentResponse = await this.sqalaService.createBankTransferPayment(data, order.totalAmount);

    if (paymentResponse.success) {
      // Atualizar o pedido com o ID do pagamento
      await this.ordersService.update(order.id, {
        paymentId: paymentResponse.paymentId,
      });
    }

    return paymentResponse;
  }

  async processITPPayment(data: CreateITPPaymentDto): Promise<PaymentResponseDto> {
    // Buscar o pedido
    const order = await this.ordersService.findOne(data.orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Verificar se o pedido já foi pago
    if (order.status === OrderStatus.PAID) {
      throw new Error('Pedido já foi pago');
    }

    // Processar o pagamento
    const paymentResponse = await this.sqalaService.createITPPayment(data, order.totalAmount);

    if (paymentResponse.success) {
      // Atualizar o pedido com o ID do pagamento
      await this.ordersService.update(order.id, {
        paymentId: paymentResponse.paymentId,
      });
    }

    return paymentResponse;
  }

  async checkPaymentStatus(orderId: string): Promise<any> {
    // Buscar o pedido
    const order = await this.ordersService.findOne(orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (!order.paymentId) {
      throw new Error('Pedido não possui pagamento associado');
    }

    // Verificar o status do pagamento
    const paymentStatus = await this.sqalaService.getPaymentStatus(order.paymentId, order.paymentMethod);

    // Se o pagamento foi confirmado, atualizar o status do pedido e dos ingressos
    if (paymentStatus.status === 'PAID' && order.status !== OrderStatus.PAID) {
      await this.ordersService.update(order.id, {
        status: OrderStatus.PAID,
      });

      // Atualizar o status dos ingressos
      for (const ticket of order.tickets) {
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: TicketStatus.PAID },
        });
      }
    }

    return {
      orderId: order.id,
      paymentId: order.paymentId,
      paymentMethod: order.paymentMethod,
      status: paymentStatus.status,
      details: paymentStatus,
    };
  }

  async refundPayment(orderId: string): Promise<any> {
    // Buscar o pedido
    const order = await this.ordersService.findOne(orderId);
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (!order.paymentId) {
      throw new Error('Pedido não possui pagamento associado');
    }

    if (order.status !== OrderStatus.PAID) {
      throw new Error('Apenas pedidos pagos podem ser reembolsados');
    }

    // Processar o reembolso
    const refundResult = await this.sqalaService.refundPayment(order.paymentId, order.paymentMethod);

    // Atualizar o status do pedido
    await this.ordersService.update(order.id, {
      status: OrderStatus.REFUNDED,
    });

    // Atualizar o status dos ingressos
    for (const ticket of order.tickets) {
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.CANCELED },
      });
    }

    return {
      orderId: order.id,
      paymentId: order.paymentId,
      refundId: refundResult.id,
      status: 'REFUNDED',
    };
  }
}

