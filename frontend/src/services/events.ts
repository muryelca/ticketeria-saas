import { api } from './api';
import { Event, CreateEventRequest } from '@/types';

export const eventService = {
  async getEvents(filters?: any): Promise<Event[]> {
    const response = await api.get('/events', { params: filters });
    return response.data;
  },

  async getEvent(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await api.post('/events', data);
    return response.data;
  },

  async updateEvent(id: string, data: Partial<CreateEventRequest>): Promise<Event> {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },
};

