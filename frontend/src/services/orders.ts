import { api } from './api';
import { Order, CreateOrderRequest } from '@/types';

export const orderService = {
  async getOrders(userId?: string): Promise<Order[]> {
    const response = await api.get('/orders', { params: { userId } });
    return response.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post('/orders', data);
    return response.data;
  },
};

