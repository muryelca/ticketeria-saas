# API Documentation - Ticketeria

## Visão Geral

A API do Ticketeria é uma REST API construída com NestJS que fornece endpoints para todas as funcionalidades do sistema de venda de ingressos. A API segue padrões RESTful e utiliza autenticação JWT.

## Base URL

- **Desenvolvimento**: `http://localhost:3001`
- **Produção**: `https://api.ticketeria.com`

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após o login, você receberá um access token que deve ser incluído no header `Authorization` de todas as requisições protegidas.

### Header de Autenticação
```
Authorization: Bearer <access_token>
```

### Fluxo de Autenticação
1. Fazer login com email/senha
2. Receber access_token e refresh_token
3. Usar access_token nas requisições
4. Renovar token quando expirar

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou ausente |
| 403 | Forbidden - Sem permissão para acessar |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito de dados |
| 422 | Unprocessable Entity - Erro de validação |
| 500 | Internal Server Error - Erro interno |

## Estrutura de Resposta

### Sucesso
```json
{
  "data": {
    // Dados da resposta
  },
  "message": "Operação realizada com sucesso",
  "timestamp": "2024-12-08T10:30:00Z"
}
```

### Erro
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email é obrigatório"
      }
    ]
  },
  "timestamp": "2024-12-08T10:30:00Z"
}
```

## Endpoints

### Authentication

#### POST /auth/login
Realiza login no sistema.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

#### POST /auth/register
Registra um novo usuário.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "user@example.com",
  "password": "password123",
  "phone": "+5511999999999",
  "cpf": "12345678901",
  "role": "CUSTOMER"
}
```

#### POST /auth/refresh
Renova o access token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /auth/profile
Retorna o perfil do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "user@example.com",
  "phone": "+5511999999999",
  "cpf": "12345678901",
  "role": "CUSTOMER",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Users

#### GET /users
Lista usuários (Admin apenas).

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `role` (string): Filtrar por role
- `search` (string): Buscar por nome ou email

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "user@example.com",
      "role": "CUSTOMER",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /users/:id
Retorna um usuário específico.

#### PUT /users/:id
Atualiza um usuário.

#### DELETE /users/:id
Remove um usuário.

### Events

#### GET /events
Lista eventos públicos.

**Query Parameters:**
- `page` (number): Página
- `limit` (number): Itens por página
- `status` (string): Filtrar por status
- `location` (string): Filtrar por localização
- `startDate` (string): Data de início (ISO)
- `endDate` (string): Data de fim (ISO)
- `search` (string): Buscar por título

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Festival de Música",
      "description": "O maior festival do ano",
      "location": "São Paulo, SP",
      "startDate": "2024-12-25T20:00:00Z",
      "endDate": "2024-12-26T06:00:00Z",
      "bannerUrl": "https://example.com/banner.jpg",
      "status": "PUBLISHED",
      "organizer": {
        "id": "uuid",
        "name": "Organizador",
        "email": "org@example.com"
      },
      "ticketTypes": [
        {
          "id": "uuid",
          "name": "Pista",
          "price": 100.00,
          "quantity": 1000,
          "available": 850
        }
      ]
    }
  ]
}
```

#### GET /events/:id
Retorna detalhes de um evento específico.

#### POST /events
Cria um novo evento (Organizer/Admin).

**Request Body:**
```json
{
  "title": "Festival de Música",
  "description": "O maior festival do ano",
  "location": "São Paulo, SP",
  "startDate": "2024-12-25T20:00:00Z",
  "endDate": "2024-12-26T06:00:00Z",
  "bannerUrl": "https://example.com/banner.jpg",
  "status": "DRAFT"
}
```

#### PUT /events/:id
Atualiza um evento.

#### DELETE /events/:id
Remove um evento.

### Ticket Types

#### GET /ticket-types
Lista tipos de ingressos.

**Query Parameters:**
- `eventId` (string): Filtrar por evento

#### POST /ticket-types
Cria um novo tipo de ingresso.

**Request Body:**
```json
{
  "name": "Pista",
  "description": "Ingresso para área da pista",
  "price": 100.00,
  "quantity": 1000,
  "startSaleDate": "2024-11-01T00:00:00Z",
  "endSaleDate": "2024-12-25T18:00:00Z",
  "eventId": "uuid"
}
```

### Tickets

#### GET /tickets
Lista ingressos do usuário.

#### GET /tickets/:id
Retorna detalhes de um ingresso.

#### GET /tickets/code/:code
Busca ingresso por código.

#### POST /tickets/courtesy/bulk
Cria ingressos cortesia em lote.

**Request Body:**
```json
{
  "ticketTypeId": "uuid",
  "recipients": [
    {
      "name": "João Silva",
      "email": "joao@example.com"
    },
    {
      "name": "Maria Santos",
      "email": "maria@example.com"
    }
  ]
}
```

### Orders

#### GET /orders
Lista pedidos do usuário.

#### GET /orders/:id
Retorna detalhes de um pedido.

#### POST /orders
Cria um novo pedido.

**Request Body:**
```json
{
  "items": [
    {
      "ticketTypeId": "uuid",
      "quantity": 2
    }
  ],
  "promoterCode": "DESCONTO10",
  "paymentMethod": "PIX"
}
```

**Response:**
```json
{
  "id": "uuid",
  "totalAmount": 180.00,
  "status": "PENDING",
  "paymentMethod": "PIX",
  "items": [
    {
      "ticketType": {
        "name": "Pista",
        "price": 100.00
      },
      "quantity": 2,
      "unitPrice": 90.00,
      "totalPrice": 180.00
    }
  ],
  "payment": {
    "id": "payment_uuid",
    "status": "PENDING",
    "pixCode": "00020126580014BR.GOV.BCB.PIX...",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Payments

#### POST /payments/pix
Processa pagamento via PIX.

**Request Body:**
```json
{
  "orderId": "uuid",
  "amount": 180.00,
  "description": "Pagamento de ingressos",
  "customerName": "João Silva",
  "customerDocument": "12345678901"
}
```

#### POST /payments/credit-card
Processa pagamento via cartão de crédito.

**Request Body:**
```json
{
  "orderId": "uuid",
  "amount": 180.00,
  "installments": 1,
  "card": {
    "number": "4111111111111111",
    "holderName": "JOAO SILVA",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  },
  "customer": {
    "name": "João Silva",
    "document": "12345678901",
    "email": "joao@example.com"
  }
}
```

#### GET /payments/status/:orderId
Verifica status do pagamento.

#### POST /payments/refund/:orderId
Processa estorno de pagamento.

### Promoter Codes

#### GET /promoter-codes
Lista códigos do promoter.

#### POST /promoter-codes
Cria um novo código promocional.

**Request Body:**
```json
{
  "code": "DESCONTO10",
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "startDate": "2024-11-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "maxUses": 100,
  "eventIds": ["uuid1", "uuid2"]
}
```

#### GET /promoter-codes/code/:code
Valida um código promocional.

#### GET /promoter-codes/stats
Retorna estatísticas de uso dos códigos.

### Reports

#### GET /reports/sales
Relatório de vendas.

**Query Parameters:**
- `startDate` (string): Data de início
- `endDate` (string): Data de fim
- `eventId` (string): Filtrar por evento
- `organizerId` (string): Filtrar por organizador

#### GET /reports/events
Relatório de eventos.

#### GET /reports/promoters
Relatório de promoters.

#### POST /reports/generate
Gera relatório personalizado.

**Request Body:**
```json
{
  "type": "SALES_DETAILED",
  "filters": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "eventIds": ["uuid1", "uuid2"]
  },
  "format": "PDF"
}
```

### Dashboard

#### GET /dashboard/admin
Dashboard administrativo.

**Response:**
```json
{
  "summary": {
    "totalSales": 150000.00,
    "totalTicketsSold": 1500,
    "totalEvents": 25,
    "totalUsers": 5000
  },
  "salesByMonth": [
    {
      "month": "2024-01",
      "sales": 10000.00,
      "tickets": 100
    }
  ],
  "topEvents": [
    {
      "id": "uuid",
      "title": "Festival de Música",
      "sales": 50000.00,
      "tickets": 500
    }
  ]
}
```

#### GET /dashboard/organizer
Dashboard do organizador.

#### GET /dashboard/promoter
Dashboard do promoter.

## Webhooks

### Payment Confirmation
Webhook para confirmação de pagamentos.

**URL**: `POST /webhooks/payment-confirmation`

**Headers:**
```
X-Webhook-Signature: sha256=...
Content-Type: application/json
```

**Payload:**
```json
{
  "event": "payment.confirmed",
  "data": {
    "paymentId": "uuid",
    "orderId": "uuid",
    "status": "PAID",
    "amount": 180.00,
    "paidAt": "2024-12-08T10:30:00Z"
  }
}
```

## Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Geral**: 100 requisições por minuto por IP
- **Login**: 5 tentativas por minuto por IP
- **Criação de pedidos**: 10 pedidos por minuto por usuário

## Paginação

Endpoints que retornam listas suportam paginação:

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtros e Busca

Muitos endpoints suportam filtros e busca:

**Operadores de Filtro:**
- `eq`: Igual
- `ne`: Diferente
- `gt`: Maior que
- `gte`: Maior ou igual
- `lt`: Menor que
- `lte`: Menor ou igual
- `in`: Contido em
- `like`: Contém (busca textual)

**Exemplo:**
```
GET /events?status=eq:PUBLISHED&startDate=gte:2024-12-01&search=like:festival
```

## Códigos de Erro

### Códigos Específicos do Negócio

| Código | Descrição |
|--------|-----------|
| `TICKET_SOLD_OUT` | Ingressos esgotados |
| `EVENT_NOT_PUBLISHED` | Evento não publicado |
| `SALE_PERIOD_ENDED` | Período de vendas encerrado |
| `INVALID_PROMOTER_CODE` | Código promocional inválido |
| `PAYMENT_FAILED` | Falha no pagamento |
| `INSUFFICIENT_PERMISSIONS` | Permissões insuficientes |

## Versionamento

A API utiliza versionamento via header:

```
Accept: application/vnd.ticketeria.v1+json
```

Versões disponíveis:
- `v1`: Versão atual (padrão)

## Ambientes

### Desenvolvimento
- **URL**: `http://localhost:3001`
- **Documentação**: `http://localhost:3001/docs`

### Produção
- **URL**: `https://api.ticketeria.com`
- **Documentação**: `https://api.ticketeria.com/docs`

## SDKs e Bibliotecas

### JavaScript/TypeScript
```bash
npm install @ticketeria/sdk
```

```typescript
import { TicketeriaSDK } from '@ticketeria/sdk';

const client = new TicketeriaSDK({
  apiKey: 'your-api-key',
  environment: 'production'
});

const events = await client.events.list();
```

### Python
```bash
pip install ticketeria-python
```

```python
from ticketeria import TicketeriaClient

client = TicketeriaClient(
    api_key='your-api-key',
    environment='production'
)

events = client.events.list()
```

## Exemplos de Uso

### Fluxo Completo de Compra

```typescript
// 1. Listar eventos
const events = await fetch('/events?status=PUBLISHED');

// 2. Selecionar evento e tipos de ingresso
const event = await fetch('/events/uuid');

// 3. Criar pedido
const order = await fetch('/orders', {
  method: 'POST',
  body: JSON.stringify({
    items: [{ ticketTypeId: 'uuid', quantity: 2 }],
    paymentMethod: 'PIX'
  })
});

// 4. Processar pagamento
const payment = await fetch('/payments/pix', {
  method: 'POST',
  body: JSON.stringify({
    orderId: order.id,
    amount: order.totalAmount
  })
});

// 5. Aguardar confirmação via webhook ou polling
const status = await fetch(`/payments/status/${order.id}`);
```

### Integração com Webhook

```typescript
// Endpoint para receber webhooks
app.post('/webhooks/payment-confirmation', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  
  // Verificar assinatura
  if (!verifySignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { event, data } = req.body;
  
  if (event === 'payment.confirmed') {
    // Processar confirmação de pagamento
    processPaymentConfirmation(data);
  }
  
  res.status(200).send('OK');
});
```

## Suporte

Para dúvidas sobre a API:
- 📧 Email: api-support@ticketeria.com
- 📚 Documentação: https://docs.ticketeria.com
- 💬 Discord: https://discord.gg/ticketeria

