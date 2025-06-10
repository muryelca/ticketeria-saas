import { api } from './api';
import { TicketType, Ticket, CreateTicketTypeRequest } from '@/types';

export const ticketService = {
  async getTicketTypes(eventId?: string): Promise<TicketType[]> {
    const response = await api.get('/ticket-types', { params: { eventId } });
    return response.data;
  },

  async getTicketType(id: string): Promise<TicketType> {
    const response = await api.get(`/ticket-types/${id}`);
    return response.data;
  },

  async createTicketType(data: CreateTicketTypeRequest): Promise<TicketType> {
    const response = await api.post('/ticket-types', data);
    return response.data;
  },

  async updateTicketType(id: string, data: Partial<CreateTicketTypeRequest>): Promise<TicketType> {
    const response = await api.patch(`/ticket-types/${id}`, data);
    return response.data;
  },

  async deleteTicketType(id: string): Promise<void> {
    await api.delete(`/ticket-types/${id}`);
  },

  async getTickets(userId?: string, eventId?: string): Promise<Ticket[]> {
    const response = await api.get('/tickets', { params: { userId, eventId } });
    return response.data;
  },

  async getTicket(id: string): Promise<Ticket> {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  async getTicketByCode(code: string): Promise<Ticket> {
    const response = await api.get(`/tickets/code/${code}`);
    return response.data;
  },

  async createCourtesyTickets(data: { ticketTypeId: string; recipients: { name: string; email: string }[] }): Promise<Ticket[]> {
    const response = await api.post('/tickets/courtesy/bulk', data);
    return response.data;
  },
};

