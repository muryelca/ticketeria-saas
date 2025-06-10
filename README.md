# Ticketeria - Sistema Completo de Venda de Ingressos

![Ticketeria Logo](https://via.placeholder.com/400x100/1976d2/ffffff?text=Ticketeria)

**Ticketeria** é um SaaS completo para venda de ingressos de eventos, desenvolvido com tecnologias modernas e arquitetura escalável. O sistema oferece uma solução completa para organizadores de eventos, promoters e clientes, com funcionalidades avançadas de gestão, vendas e relatórios.

## 🚀 Características Principais

### Para Organizadores de Eventos
- **Criação e Gestão de Eventos**: Interface intuitiva para criar e gerenciar eventos
- **Tipos de Ingressos**: Configuração flexível de diferentes tipos de ingressos
- **Dashboard Completo**: Visualização em tempo real de vendas e métricas
- **Relatórios Avançados**: Relatórios detalhados de vendas, público e performance
- **Gestão de Cortesias**: Sistema para envio em lote de ingressos cortesia

### Para Promoters
- **Códigos de Desconto**: Criação e gestão de cupons promocionais
- **Comissões**: Sistema de tracking de vendas e comissões
- **Dashboard Personalizado**: Métricas específicas para promoters
- **Relatórios de Performance**: Acompanhamento detalhado das vendas

### Para Clientes
- **Compra Simplificada**: Processo de compra otimizado e intuitivo
- **Múltiplos Métodos de Pagamento**: PIX, Cartão, Boleto, Transferência Bancária
- **Ingressos Digitais**: Geração automática de QR codes
- **Histórico de Compras**: Acesso completo ao histórico de ingressos

### Funcionalidades Técnicas
- **Arquitetura CQRS**: Separação de comandos e consultas para alta performance
- **Microserviços Ready**: Arquitetura preparada para evolução em microserviços
- **Mensageria**: RabbitMQ para processamento assíncrono
- **Cache Distribuído**: Redis para otimização de performance
- **Pagamentos Integrados**: Integração completa com Sqala.tech
- **Deploy Automatizado**: Docker e Terraform para Google Cloud

## 🛠️ Stack Tecnológica

### Backend
- **NestJS** - Framework Node.js com TypeScript
- **Prisma** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **RabbitMQ** - Message broker para processamento assíncrono
- **Redis** - Cache distribuído
- **JWT** - Autenticação e autorização

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Material-UI** - Biblioteca de componentes
- **Tailwind CSS** - Framework CSS utilitário
- **Axios** - Cliente HTTP

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **Terraform** - Infrastructure as Code
- **Google Cloud Platform** - Cloud provider
- **Nginx** - Reverse proxy e load balancer

### Pagamentos
- **Sqala.tech** - Gateway de pagamentos brasileiro
  - PIX (identificado e não identificado)
  - Cartão de crédito (à vista e parcelado)
  - Boleto bancário
  - Transferência bancária
  - ITP (Open Finance)

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **Docker** e **Docker Compose**
- **PostgreSQL** 15+
- **Git**

Para deploy em produção:
- **Google Cloud Platform** account
- **Terraform** 1.6+
- **Google Cloud SDK**

## 🚀 Instalação e Configuração

### 1. Clone do Repositório

```bash
git clone https://github.com/seu-usuario/ticketeria-saas.git
cd ticketeria-saas
```

### 2. Configuração do Ambiente de Desenvolvimento

```bash
# Inicializar infraestrutura (PostgreSQL, RabbitMQ, Redis)
./scripts/dev-setup.sh

# Configurar backend
cd backend/ticketeria-api
npm install
cp .env.example .env
# Editar .env com suas configurações
npx prisma migrate dev
npx prisma generate
npm run start:dev

# Em outro terminal, configurar frontend
cd frontend
npm install
cp .env.local.example .env.local
# Editar .env.local com suas configurações
npm run dev
```

### 3. Acesso à Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)
- **PostgreSQL**: localhost:5432

## 🐳 Deploy com Docker

### Desenvolvimento Completo

```bash
# Deploy completo com Docker Compose
./scripts/deploy.sh
```

### Produção

```bash
# Deploy em produção
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ Deploy no Google Cloud Platform

### 1. Configuração Inicial

```bash
# Configurar GCP
./scripts/setup-gcp.sh
```

### 2. Deploy da Infraestrutura

```bash
cd terraform

# Desenvolvimento
./deploy.sh dev plan
./deploy.sh dev apply

# Produção
./deploy.sh prod plan
./deploy.sh prod apply
```

## 📚 Documentação

- [**Arquitetura do Sistema**](docs/architecture.md)
- [**Guia de Desenvolvimento**](docs/development.md)
- [**API Documentation**](docs/api.md)
- [**Guia de Deploy**](docs/deployment.md)
- [**Configuração de Pagamentos**](docs/payments.md)
- [**Troubleshooting**](docs/troubleshooting.md)

## 🏗️ Arquitetura

O sistema segue uma arquitetura modular baseada em CQRS (Command Query Responsibility Segregation), preparada para evolução em microserviços:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Load Balancer │    │   Backend API   │
│   (Next.js)     │◄──►│   (Nginx)       │◄──►│   (NestJS)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   Message Queue │◄────────────┤
                       │   (RabbitMQ)    │             │
                       └─────────────────┘             │
                                                        │
┌─────────────────┐    ┌─────────────────┐             │
│   Cache         │◄──►│   Database      │◄────────────┘
│   (Redis)       │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘
```

### Módulos do Backend

- **Auth**: Autenticação e autorização
- **Users**: Gestão de usuários
- **Events**: Criação e gestão de eventos
- **Tickets**: Tipos de ingressos e ingressos
- **Orders**: Processamento de pedidos
- **Payments**: Integração com gateways de pagamento
- **Promoter Codes**: Códigos promocionais
- **Reports**: Geração de relatórios
- **Dashboard**: Métricas e analytics
- **Messaging**: Processamento assíncrono

## 🔐 Segurança

- **Autenticação JWT** com refresh tokens
- **Autorização baseada em roles** (Admin, Organizer, Promoter, Customer)
- **Validação de dados** com class-validator
- **Rate limiting** para APIs
- **CORS** configurado adequadamente
- **Sanitização de inputs**
- **Logs de auditoria**

## 📊 Monitoramento

- **Health checks** automáticos
- **Logs centralizados** com Winston
- **Métricas de performance**
- **Alertas de falhas**
- **Monitoring de recursos**

## 🧪 Testes

```bash
# Backend
cd backend/ticketeria-api
npm run test
npm run test:e2e
npm run test:cov

# Frontend
cd frontend
npm run test
npm run test:coverage
```

## 📈 Performance

- **Cache distribuído** com Redis
- **Otimização de queries** com Prisma
- **Lazy loading** no frontend
- **Compressão de assets**
- **CDN** para arquivos estáticos
- **Auto-scaling** na infraestrutura

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvedor Principal**: Manus AI
- **Arquitetura**: Sistema modular e escalável
- **DevOps**: Docker + Terraform + GCP

## 📞 Suporte

Para suporte técnico ou dúvidas:
- 📧 Email: suporte@ticketeria.com
- 📱 WhatsApp: +55 11 99999-9999
- 🌐 Website: https://ticketeria.com

## 🗺️ Roadmap

### Versão 1.0 (Atual)
- ✅ Sistema básico de vendas
- ✅ Múltiplos métodos de pagamento
- ✅ Dashboard para organizadores
- ✅ Sistema de promoters
- ✅ Deploy automatizado

### Versão 1.1 (Próxima)
- 🔄 App mobile (React Native)
- 🔄 Integração com redes sociais
- 🔄 Sistema de avaliações
- 🔄 Chat de suporte

### Versão 2.0 (Futuro)
- 🔄 Microserviços completos
- 🔄 Machine Learning para recomendações
- 🔄 Marketplace de eventos
- 🔄 Sistema de afiliados

---

**Ticketeria** - Transformando a experiência de eventos no Brasil 🇧🇷

