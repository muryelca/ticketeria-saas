import { api } from './api';
import { DashboardData } from '@/types';

export const dashboardService = {
  async getAdminDashboard(): Promise<DashboardData> {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  async getOrganizerDashboard(organizerId?: string): Promise<DashboardData> {
    const response = await api.get('/dashboard/organizer', { params: { organizerId } });
    return response.data;
  },

  async getPromoterDashboard(promoterId?: string): Promise<DashboardData> {
    const response = await api.get('/dashboard/promoter', { params: { promoterId } });
    return response.data;
  },
};

