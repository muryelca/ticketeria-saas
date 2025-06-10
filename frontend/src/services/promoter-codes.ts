import { api } from './api';
import { PromoterCode } from '@/types';

export const promoterCodeService = {
  async getPromoterCodes(promoterId?: string): Promise<PromoterCode[]> {
    const response = await api.get('/promoter-codes', { params: { promoterId } });
    return response.data;
  },

  async getPromoterCode(id: string): Promise<PromoterCode> {
    const response = await api.get(`/promoter-codes/${id}`);
    return response.data;
  },

  async getPromoterCodeByCode(code: string): Promise<PromoterCode> {
    const response = await api.get(`/promoter-codes/code/${code}`);
    return response.data;
  },

  async createPromoterCode(data: any): Promise<PromoterCode> {
    const response = await api.post('/promoter-codes', data);
    return response.data;
  },

  async updatePromoterCode(id: string, data: any): Promise<PromoterCode> {
    const response = await api.patch(`/promoter-codes/${id}`, data);
    return response.data;
  },

  async deletePromoterCode(id: string): Promise<void> {
    await api.delete(`/promoter-codes/${id}`);
  },

  async getUsageStats(promoterId?: string): Promise<any> {
    const response = await api.get('/promoter-codes/stats', { params: { promoterId } });
    return response.data;
  },
};

