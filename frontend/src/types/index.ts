export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  role: 'ADMIN' | 'ORGANIZER' | 'PROMOTER' | 'CUSTOMER';
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
  bannerUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELED' | 'FINISHED';
  organizerId: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  ticketTypes: TicketType[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  startSaleDate: string;
  endSaleDate: string;
  eventId: string;
  event?: Event;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  code: string;
  status: 'RESERVED' | 'PAID' | 'CANCELED' | 'USED' | 'EXPIRED';
  price: number;
  originalPrice: number;
  isCourtesy: boolean;
  ticketTypeId: string;
  ticketType: TicketType;
  userId?: string;
  user?: User;
  orderId?: string;
  order?: Order;
  promoterCodeId?: string;
  promoterCode?: PromoterCode;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'REFUNDED';
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'BANK_TRANSFER' | 'ITP';
  paymentId?: string;
  tickets: Ticket[];
  createdAt: string;
  updatedAt: string;
}

export interface PromoterCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  startDate: string;
  endDate: string;
  maxUses?: number;
  currentUses: number;
  promoterId: string;
  promoter: User;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
  role?: 'ADMIN' | 'ORGANIZER' | 'PROMOTER' | 'CUSTOMER';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
  bannerUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELED' | 'FINISHED';
}

export interface CreateTicketTypeRequest {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  startSaleDate: string;
  endSaleDate: string;
  eventId: string;
}

export interface CreateOrderRequest {
  ticketIds: string[];
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'BANK_TRANSFER' | 'ITP';
  promoterCode?: string;
}

export interface DashboardData {
  summary: {
    totalSales: number;
    totalTicketsSold: number;
    totalEvents: number;
    totalUsers?: number;
  };
  salesByMonth?: any[];
  topEvents?: any[];
  topPromoters?: any[];
  salesByEvent?: any[];
  salesByTicketType?: any[];
  salesByCode?: any[];
}

