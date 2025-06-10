import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { 
  CreatePixPaymentDto, 
  CreateCreditCardPaymentDto,
  CreateBoletoPaymentDto,
  CreateBankTransferPaymentDto,
  CreateITPPaymentDto,
  PaymentResponseDto 
} from './dto/payment.dto';

@Injectable()
export class SqalaService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SQALA_API_KEY');
    this.apiUrl = this.configService.get<string>('SQALA_API_URL');
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  async createPixPayment(data: CreatePixPaymentDto, amount: number): Promise<PaymentResponseDto> {
    try {
      const payload = {
        amount,
        description: `Pagamento de ingressos - Pedido ${data.orderId}`,
        name: data.name,
        cpf: data.cpf,
        require_cpf: data.requireCpf,
        enable_split: data.enableSplit,
      };

      const response = await axios.post(
        `${this.apiUrl}/pix`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        paymentId: response.data.id,
        paymentUrl: response.data.payment_url,
        qrCode: response.data.qr_code,
      };
    } catch (error) {
      console.error('Erro ao criar pagamento Pix:', error.response?.data || error.message);
      return {
        success: false,
        paymentId: null,
        message: 'Erro ao processar pagamento Pix',
      };
    }
  }

  async createCreditCardPayment(data: CreateCreditCardPaymentDto, amount: number): Promise<PaymentResponseDto> {
    try {
      const payload = {
        amount,
        description: `Pagamento de ingressos - Pedido ${data.orderId}`,
        card: {
          number: data.cardNumber,
          holder_name: data.cardholderName,
          expiration_date: data.expirationDate,
          cvv: data.cvv,
        },
        installments: data.installments,
      };

      const response = await axios.post(
        `${this.apiUrl}/credit-card`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        paymentId: response.data.id,
      };
    } catch (error) {
      console.error('Erro ao criar pagamento com cartão:', error.response?.data || error.message);
      return {
        success: false,
        paymentId: null,
        message: 'Erro ao processar pagamento com cartão',
      };
    }
  }

  async createBoletoPayment(data: CreateBoletoPaymentDto, amount: number): Promise<PaymentResponseDto> {
    try {
      const payload = {
        amount,
        description: `Pagamento de ingressos - Pedido ${data.orderId}`,
        customer: {
          name: data.name,
          cpf: data.cpf,
          email: data.email,
          phone: data.phone,
        },
      };

      const response = await axios.post(
        `${this.apiUrl}/boleto`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        paymentId: response.data.id,
        paymentUrl: response.data.payment_url,
        barCode: response.data.bar_code,
      };
    } catch (error) {
      console.error('Erro ao criar pagamento com boleto:', error.response?.data || error.message);
      return {
        success: false,
        paymentId: null,
        message: 'Erro ao processar pagamento com boleto',
      };
    }
  }

  async createBankTransferPayment(data: CreateBankTransferPaymentDto, amount: number): Promise<PaymentResponseDto> {
    try {
      const payload = {
        amount,
        description: `Pagamento de ingressos - Pedido ${data.orderId}`,
        customer: {
          name: data.name,
          cpf: data.cpf,
          email: data.email,
        },
      };

      const response = await axios.post(
        `${this.apiUrl}/bank-transfers`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        paymentId: response.data.id,
        paymentUrl: response.data.payment_url,
      };
    } catch (error) {
      console.error('Erro ao criar pagamento com transferência bancária:', error.response?.data || error.message);
      return {
        success: false,
        paymentId: null,
        message: 'Erro ao processar pagamento com transferência bancária',
      };
    }
  }

  async createITPPayment(data: CreateITPPaymentDto, amount: number): Promise<PaymentResponseDto> {
    try {
      const payload = {
        amount,
        description: `Pagamento de ingressos - Pedido ${data.orderId}`,
        customer: {
          name: data.name,
          cpf: data.cpf,
          email: data.email,
        },
        bank: data.bank,
      };

      const response = await axios.post(
        `${this.apiUrl}/itp`,
        payload,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        paymentId: response.data.id,
        paymentUrl: response.data.payment_url,
      };
    } catch (error) {
      console.error('Erro ao criar pagamento ITP:', error.response?.data || error.message);
      return {
        success: false,
        paymentId: null,
        message: 'Erro ao processar pagamento ITP',
      };
    }
  }

  async getPaymentStatus(paymentId: string, paymentMethod: string): Promise<any> {
    try {
      let endpoint;
      
      switch (paymentMethod) {
        case 'PIX':
          endpoint = `/pix/${paymentId}`;
          break;
        case 'CREDIT_CARD':
          endpoint = `/credit-card/${paymentId}`;
          break;
        case 'BOLETO':
          endpoint = `/boleto/${paymentId}`;
          break;
        case 'BANK_TRANSFER':
          endpoint = `/bank-transfers/${paymentId}`;
          break;
        case 'ITP':
          endpoint = `/itp/${paymentId}`;
          break;
        default:
          throw new Error('Método de pagamento não suportado');
      }

      const response = await axios.get(
        `${this.apiUrl}${endpoint}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error.response?.data || error.message);
      throw new Error('Erro ao verificar status do pagamento');
    }
  }

  async refundPayment(paymentId: string, paymentMethod: string): Promise<any> {
    try {
      let endpoint;
      
      switch (paymentMethod) {
        case 'PIX':
          endpoint = `/pix/${paymentId}/refund`;
          break;
        case 'CREDIT_CARD':
          endpoint = `/credit-card/${paymentId}/refund`;
          break;
        default:
          throw new Error('Reembolso não suportado para este método de pagamento');
      }

      const response = await axios.post(
        `${this.apiUrl}${endpoint}`,
        {},
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao processar reembolso:', error.response?.data || error.message);
      throw new Error('Erro ao processar reembolso');
    }
  }
}

