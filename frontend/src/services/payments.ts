import { api } from './api';

export const paymentService = {
  async processPixPayment(data: any): Promise<any> {
    const response = await api.post('/payments/pix', data);
    return response.data;
  },

  async processCreditCardPayment(data: any): Promise<any> {
    const response = await api.post('/payments/credit-card', data);
    return response.data;
  },

  async processBoletoPayment(data: any): Promise<any> {
    const response = await api.post('/payments/boleto', data);
    return response.data;
  },

  async processBankTransferPayment(data: any): Promise<any> {
    const response = await api.post('/payments/bank-transfer', data);
    return response.data;
  },

  async processITPPayment(data: any): Promise<any> {
    const response = await api.post('/payments/itp', data);
    return response.data;
  },

  async checkPaymentStatus(orderId: string): Promise<any> {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
  },

  async refundPayment(orderId: string): Promise<any> {
    const response = await api.post(`/payments/refund/${orderId}`);
    return response.data;
  },
};

