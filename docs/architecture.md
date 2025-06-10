# Arquitetura do Sistema Ticketeria

## Visão Geral

O sistema Ticketeria foi projetado seguindo princípios de arquitetura moderna, escalabilidade e manutenibilidade. A arquitetura é baseada em uma abordagem modular que permite evolução gradual para microserviços, utilizando padrões como CQRS (Command Query Responsibility Segregation) e Event Sourcing.

## Princípios Arquiteturais

### 1. Separação de Responsabilidades
Cada módulo tem uma responsabilidade específica e bem definida, seguindo o princípio da responsabilidade única (SRP).

### 2. Baixo Acoplamento
Os módulos são independentes e se comunicam através de interfaces bem definidas, permitindo evolução independente.

### 3. Alta Coesão
Funcionalidades relacionadas são agrupadas no mesmo módulo, facilitando manutenção e compreensão.

### 4. Escalabilidade Horizontal
A arquitetura permite escalar componentes individualmente conforme a demanda.

## Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Next.js Application (React + TypeScript + Material-UI)    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Public    │ │   Admin     │ │  Organizer  │          │
│  │   Portal    │ │   Panel     │ │   Panel     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   LOAD BALANCER                            │
├─────────────────────────────────────────────────────────────┤
│              Nginx Reverse Proxy                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   SSL/TLS   │ │   Caching   │ │ Rate Limit  │          │
│  │ Termination │ │   Layer     │ │   Control   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│              NestJS Backend API                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    Auth     │ │   Events    │ │   Orders    │          │
│  │   Module    │ │   Module    │ │   Module    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Users     │ │  Tickets    │ │  Payments   │          │
│  │   Module    │ │   Module    │ │   Module    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   MESSAGING LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                    RabbitMQ                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Events    │ │   Orders    │ │   Emails    │          │
│  │    Queue    │ │    Queue    │ │    Queue    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ PostgreSQL  │ │    Redis    │ │   Cloud     │          │
│  │  Database   │ │    Cache    │ │   Storage   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Padrão CQRS (Command Query Responsibility Segregation)

### Conceito
O padrão CQRS separa as operações de leitura (Queries) das operações de escrita (Commands), permitindo otimizações específicas para cada tipo de operação.

### Implementação

#### Commands (Escrita)
```typescript
// Exemplo: Criar Evento
export class CreateEventCommand extends BaseCommand {
  constructor(
    id: string,
    public readonly eventData: CreateEventDto
  ) {
    super(id);
  }
}

@CommandHandler(CreateEventCommand)
export class CreateEventHandler implements ICommandHandler<CreateEventCommand> {
  async execute(command: CreateEventCommand): Promise<Event> {
    // Lógica de criação do evento
    // Validações de negócio
    // Persistência no banco
    // Publicação de eventos
  }
}
```

#### Queries (Leitura)
```typescript
// Exemplo: Buscar Eventos
export class GetEventsQuery extends BaseQuery {
  constructor(
    id: string,
    public readonly filters: EventFiltersDto
  ) {
    super(id);
  }
}

@QueryHandler(GetEventsQuery)
export class GetEventsHandler implements IQueryHandler<GetEventsQuery> {
  async execute(query: GetEventsQuery): Promise<Event[]> {
    // Lógica de busca otimizada
    // Uso de cache quando apropriado
    // Projeções específicas
  }
}
```

#### Events (Eventos de Domínio)
```typescript
export class EventCreatedEvent extends BaseEvent {
  constructor(
    id: string,
    public readonly event: Event
  ) {
    super(id);
  }
}

@EventsHandler(EventCreatedEvent)
export class EventCreatedHandler implements IEventHandler<EventCreatedEvent> {
  async handle(event: EventCreatedEvent): Promise<void> {
    // Atualizar cache
    // Enviar notificações
    // Integrar com sistemas externos
  }
}
```

## Módulos do Sistema

### 1. Auth Module
**Responsabilidade**: Autenticação e autorização de usuários

**Componentes**:
- JWT Strategy
- Role-based Guards
- Password Hashing
- Refresh Token Management

**Endpoints**:
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `GET /auth/profile`

### 2. Users Module
**Responsabilidade**: Gestão de usuários do sistema

**Entidades**:
- User (Admin, Organizer, Promoter, Customer)
- Profile Information
- Preferences

**Funcionalidades**:
- CRUD de usuários
- Gestão de perfis
- Controle de permissões

### 3. Events Module
**Responsabilidade**: Criação e gestão de eventos

**Entidades**:
- Event
- Event Categories
- Event Settings

**Funcionalidades**:
- Criação de eventos
- Gestão de informações
- Controle de status
- Upload de imagens

### 4. Tickets Module
**Responsabilidade**: Gestão de tipos de ingressos e ingressos

**Entidades**:
- TicketType
- Ticket
- Ticket Validation

**Funcionalidades**:
- Configuração de tipos
- Geração de ingressos
- Validação de QR codes
- Controle de estoque

### 5. Orders Module
**Responsabilidade**: Processamento de pedidos

**Entidades**:
- Order
- OrderItem
- Order Status

**Funcionalidades**:
- Criação de pedidos
- Cálculo de valores
- Aplicação de descontos
- Controle de status

### 6. Payments Module
**Responsabilidade**: Integração com gateways de pagamento

**Integrações**:
- Sqala.tech API
- PIX, Cartão, Boleto, TED, ITP

**Funcionalidades**:
- Processamento de pagamentos
- Webhooks de confirmação
- Controle de status
- Refunds

### 7. Promoter Codes Module
**Responsabilidade**: Gestão de códigos promocionais

**Entidades**:
- PromoterCode
- Usage Tracking
- Commission Calculation

**Funcionalidades**:
- Criação de códigos
- Validação de uso
- Relatórios de performance
- Cálculo de comissões

### 8. Reports Module
**Responsabilidade**: Geração de relatórios

**Tipos de Relatórios**:
- Vendas por período
- Performance de eventos
- Análise de promoters
- Relatórios financeiros

### 9. Dashboard Module
**Responsabilidade**: Métricas e analytics em tempo real

**Dashboards**:
- Admin Dashboard
- Organizer Dashboard
- Promoter Dashboard

**Métricas**:
- Vendas em tempo real
- Conversão de funil
- Performance de eventos
- Análise de público

## Banco de Dados

### Estratégia de Modelagem
O banco de dados foi modelado seguindo princípios de normalização, mas com algumas desnormalizações estratégicas para otimização de performance.

### Principais Entidades

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(14),
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(500) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  banner_url VARCHAR(500),
  status event_status DEFAULT 'DRAFT',
  organizer_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tickets
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  status ticket_status DEFAULT 'RESERVED',
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  is_courtesy BOOLEAN DEFAULT FALSE,
  ticket_type_id UUID REFERENCES ticket_types(id),
  user_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  promoter_code_id UUID REFERENCES promoter_codes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Índices e Otimizações

```sql
-- Índices para performance
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_tickets_code ON tickets(code);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Índices compostos
CREATE INDEX idx_tickets_type_status ON tickets(ticket_type_id, status);
CREATE INDEX idx_events_organizer_status ON events(organizer_id, status);
```

## Cache Strategy

### Redis Implementation
O Redis é utilizado para cache de dados frequentemente acessados e sessões de usuário.

### Cache Patterns

#### 1. Cache-Aside
```typescript
async getEvent(id: string): Promise<Event> {
  // Tentar buscar no cache
  const cached = await this.redis.get(`event:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Buscar no banco de dados
  const event = await this.prisma.event.findUnique({ where: { id } });
  
  // Armazenar no cache
  await this.redis.setex(`event:${id}`, 3600, JSON.stringify(event));
  
  return event;
}
```

#### 2. Write-Through
```typescript
async updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
  // Atualizar no banco
  const event = await this.prisma.event.update({
    where: { id },
    data
  });
  
  // Atualizar no cache
  await this.redis.setex(`event:${id}`, 3600, JSON.stringify(event));
  
  return event;
}
```

### Cache Invalidation
```typescript
async invalidateEventCache(eventId: string): Promise<void> {
  await this.redis.del(`event:${eventId}`);
  await this.redis.del(`events:list:*`);
}
```

## Message Queue Architecture

### RabbitMQ Implementation
O RabbitMQ é utilizado para processamento assíncrono e comunicação entre módulos.

### Queue Patterns

#### 1. Work Queues
```typescript
// Producer
async sendEmailNotification(data: EmailData): Promise<void> {
  await this.amqp.publish('email.queue', '', Buffer.from(JSON.stringify(data)));
}

// Consumer
@RabbitSubscribe({
  exchange: '',
  routingKey: 'email.queue',
  queue: 'email.queue'
})
async handleEmailNotification(data: EmailData): Promise<void> {
  await this.emailService.sendEmail(data);
}
```

#### 2. Publish/Subscribe
```typescript
// Event Publisher
async publishEventCreated(event: Event): Promise<void> {
  await this.amqp.publish('events.exchange', 'event.created', 
    Buffer.from(JSON.stringify(event))
  );
}

// Multiple Subscribers
@RabbitSubscribe({
  exchange: 'events.exchange',
  routingKey: 'event.created',
  queue: 'cache.update.queue'
})
async handleEventCreatedForCache(event: Event): Promise<void> {
  await this.cacheService.updateEventCache(event);
}

@RabbitSubscribe({
  exchange: 'events.exchange',
  routingKey: 'event.created',
  queue: 'notification.queue'
})
async handleEventCreatedForNotification(event: Event): Promise<void> {
  await this.notificationService.notifyFollowers(event);
}
```

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Server validates credentials
3. Server generates JWT access token (15min) + refresh token (7 days)
4. Client stores tokens securely
5. Client sends access token in Authorization header
6. Server validates token on each request
7. Client refreshes token when expired
```

### Authorization Levels
- **Public**: Acesso sem autenticação
- **Customer**: Usuário autenticado básico
- **Promoter**: Usuário com permissões de promoter
- **Organizer**: Usuário organizador de eventos
- **Admin**: Acesso total ao sistema

### Security Measures
- Password hashing com bcrypt
- Rate limiting por IP e usuário
- CORS configurado adequadamente
- Input validation e sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

## Monitoring and Observability

### Logging Strategy
```typescript
// Structured logging
this.logger.log({
  action: 'event.created',
  eventId: event.id,
  organizerId: event.organizerId,
  timestamp: new Date().toISOString(),
  metadata: {
    title: event.title,
    location: event.location
  }
});
```

### Health Checks
```typescript
@Get('/health')
async healthCheck(): Promise<HealthCheckResult> {
  return this.health.check([
    () => this.prisma.healthIndicator.pingCheck('database'),
    () => this.redis.healthIndicator.pingCheck('redis'),
    () => this.rabbitmq.healthIndicator.pingCheck('rabbitmq')
  ]);
}
```

### Metrics Collection
- Request/response times
- Error rates
- Database query performance
- Cache hit/miss ratios
- Queue processing times
- Business metrics (sales, conversions)

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Load balancer distribution
- Database read replicas
- Cache clustering
- Queue clustering

### Performance Optimizations
- Database query optimization
- Eager/lazy loading strategies
- Response compression
- CDN for static assets
- Image optimization
- Pagination for large datasets

### Future Microservices Migration
A arquitetura atual está preparada para evolução gradual para microserviços:

1. **Phase 1**: Modular monolith (atual)
2. **Phase 2**: Extract payment service
3. **Phase 3**: Extract notification service
4. **Phase 4**: Extract reporting service
5. **Phase 5**: Full microservices architecture

Cada módulo já possui interfaces bem definidas e baixo acoplamento, facilitando a extração futura para serviços independentes.

