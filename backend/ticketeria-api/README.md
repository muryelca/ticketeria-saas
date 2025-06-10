# Ticketeria API

API para sistema de venda de ingressos para eventos, desenvolvida com NestJS, PostgreSQL, RabbitMQ e arquitetura CQRS.

## Tecnologias Utilizadas

- **Backend**: NestJS (TypeScript)
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Mensageria**: RabbitMQ
- **Autenticação**: JWT
- **Documentação**: Swagger
- **Arquitetura**: CQRS (Command Query Responsibility Segregation)
- **Pagamentos**: Integração com Sqala.tech

## Estrutura do Projeto

O projeto está organizado em módulos, seguindo a estrutura do NestJS e a segregação de responsabilidades do CQRS:

- **Módulo de Autenticação e Usuários**: Gerencia a criação de contas, login e informações de usuário.
- **Módulo de Eventos**: Gerencia a criação, edição e listagem de eventos.
- **Módulo de Ingressos**: Gerencia a criação, distribuição (venda e cortesia) e validação de ingressos.
- **Módulo de Cupons**: Gerencia a criação e aplicação de cupons de desconto, associados a promoters.
- **Módulo de Vendas**: Orquestra o processo de compra, integrando com o módulo de pagamentos e ingressos.
- **Módulo de Pagamentos**: Integração com a API da Sqala.tech para processamento de pagamentos.
- **Módulo de Relatórios**: Fornece endpoints para gerar relatórios de vendas e uso de cupons.
- **Módulo de Dashboard**: Agrega dados para visualização no painel administrativo.
- **Módulo de Mensageria**: Integração com RabbitMQ para comunicação assíncrona.

## Arquitetura CQRS

O padrão CQRS (Command Query Responsibility Segregation) foi aplicado para separar as operações de escrita (Comandos) das operações de leitura (Consultas):

- **Comandos**: Responsáveis por alterar o estado da aplicação (ex: criar evento, comprar ingresso).
- **Consultas**: Responsáveis por buscar dados (ex: listar eventos, visualizar dashboard).
- **Eventos**: Notificações de mudanças de estado que podem ser consumidas por outros componentes.

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- PostgreSQL
- RabbitMQ

### Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticketeria?schema=public"
   JWT_SECRET="seu-segredo-jwt"
   JWT_EXPIRATION="1d"
   RABBITMQ_URL="amqp://localhost:5672"
   SQALA_API_KEY="sua-chave-api-sqala"
   SQALA_API_URL="https://api.sqala.tech"
   ```
4. Execute as migrações do Prisma:
   ```bash
   npx prisma migrate dev
   ```
5. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

### Documentação da API

A documentação da API está disponível através do Swagger, acessível em:
```
http://localhost:3000/api
```

## Funcionalidades Principais

- **Gestão de Eventos**: Criação, edição e publicação de eventos com diferentes tipos de ingressos.
- **Venda de Ingressos**: Processo de compra online para o público geral.
- **Gestão de Ingressos Cortesia**: Funcionalidade para envio de ingressos em lote por nome e e-mail.
- **Gestão de Cupons para Promoters**: Criação e gerenciamento de cupons de desconto associados a promoters.
- **Painel Administrativo**: Dashboard com métricas de vendas e gerenciamento completo.
- **Processamento de Pagamentos**: Integração com Sqala.tech para Pix, cartão de crédito, boleto, etc.
- **Relatórios**: Geração de relatórios detalhados de vendas, incluindo uso de cupons por promoter.
- **Autenticação e Autorização**: Sistema de criação de conta e controle de acesso baseado em papéis.

## Estrutura de Banco de Dados

O banco de dados PostgreSQL é gerenciado através do Prisma ORM, com os seguintes modelos principais:

- **User**: Usuários do sistema (admin, organizador, promoter, cliente).
- **Event**: Eventos disponíveis na plataforma.
- **TicketType**: Tipos de ingressos disponíveis para cada evento.
- **Ticket**: Ingressos individuais, associados a um tipo e opcionalmente a um usuário.
- **Order**: Pedidos de compra de ingressos.
- **PromoterCode**: Códigos de desconto associados a promoters.
- **Report**: Relatórios gerados pelo sistema.

## Integração com RabbitMQ

O sistema utiliza RabbitMQ para comunicação assíncrona entre componentes, com as seguintes filas principais:

- **email_notifications**: Envio de notificações por e-mail.
- **ticket_generation**: Geração de ingressos físicos/digitais.
- **payment_processing**: Processamento de pagamentos.

## Integração com Sqala.tech

A API integra-se com a Sqala.tech para processamento de pagamentos, suportando:

- Pix
- Cartão de crédito
- Boleto
- Transferência bancária
- ITP (Open Finance)

