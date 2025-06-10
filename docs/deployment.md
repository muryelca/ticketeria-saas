# Guia de Deploy - Ticketeria

## Visão Geral

Este guia cobre todos os aspectos do deploy da aplicação Ticketeria, desde o ambiente de desenvolvimento até a produção no Google Cloud Platform. O sistema foi projetado para ser facilmente deployável usando Docker e Terraform.

## Ambientes

### 1. Desenvolvimento Local
- **Propósito**: Desenvolvimento e testes locais
- **Infraestrutura**: Docker Compose
- **Banco**: PostgreSQL local
- **Cache**: Redis local
- **Mensageria**: RabbitMQ local

### 2. Staging/Homologação
- **Propósito**: Testes de integração e validação
- **Infraestrutura**: Google Cloud Platform (configuração reduzida)
- **Banco**: Cloud SQL (instância pequena)
- **Cache**: Redis (instância pequena)

### 3. Produção
- **Propósito**: Ambiente de produção
- **Infraestrutura**: Google Cloud Platform (configuração completa)
- **Banco**: Cloud SQL (alta disponibilidade)
- **Cache**: Redis (cluster)
- **Load Balancer**: Google Cloud Load Balancer

## Deploy Local

### Pré-requisitos

```bash
# Verificar instalações
node --version    # >= 18.0.0
docker --version  # >= 20.0.0
docker-compose --version  # >= 2.0.0
```

### Configuração Inicial

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/ticketeria-saas.git
cd ticketeria-saas

# 2. Configurar ambiente
./scripts/dev-setup.sh

# 3. Configurar variáveis de ambiente
cp backend/ticketeria-api/.env.example backend/ticketeria-api/.env
cp frontend/.env.local.example frontend/.env.local

# 4. Editar configurações
nano backend/ticketeria-api/.env
nano frontend/.env.local
```

### Executar Aplicação

```bash
# Opção 1: Desenvolvimento (hot reload)
# Terminal 1 - Backend
cd backend/ticketeria-api
npm install
npx prisma migrate dev
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Opção 2: Docker Compose (produção-like)
docker-compose up -d
```

### Verificação

```bash
# Verificar serviços
curl http://localhost:3001/health  # Backend
curl http://localhost:3000         # Frontend

# Verificar logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Deploy com Docker

### Build das Imagens

```bash
# Backend
cd backend/ticketeria-api
docker build -t ticketeria-backend:latest .

# Frontend
cd frontend
docker build -t ticketeria-frontend:latest .

# Verificar imagens
docker images | grep ticketeria
```

### Deploy Completo

```bash
# Deploy com todas as dependências
docker-compose -f docker-compose.yml up -d

# Verificar status
docker-compose ps

# Verificar logs
docker-compose logs -f
```

### Deploy de Produção

```bash
# Deploy otimizado para produção
docker-compose -f docker-compose.prod.yml up -d

# Verificar health checks
docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:3000/health
```

## Deploy no Google Cloud Platform

### Pré-requisitos

```bash
# 1. Instalar Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# 2. Instalar Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# 3. Verificar instalações
gcloud --version
terraform --version
```

### Configuração do GCP

```bash
# 1. Configurar projeto
./scripts/setup-gcp.sh

# 2. Habilitar APIs necessárias
gcloud services enable compute.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 3. Configurar autenticação Docker
gcloud auth configure-docker
```

### Deploy da Infraestrutura

```bash
cd terraform

# 1. Configurar variáveis
cp environments/prod/terraform.tfvars.example environments/prod/terraform.tfvars
nano environments/prod/terraform.tfvars

# 2. Inicializar Terraform
terraform init

# 3. Planejar deploy
./deploy.sh prod plan

# 4. Aplicar infraestrutura
./deploy.sh prod apply
```

### Build e Push das Imagens

```bash
# 1. Configurar variáveis
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"

# 2. Build e tag das imagens
docker build -t gcr.io/$PROJECT_ID/ticketeria-backend:latest backend/ticketeria-api/
docker build -t gcr.io/$PROJECT_ID/ticketeria-frontend:latest frontend/

# 3. Push para Container Registry
docker push gcr.io/$PROJECT_ID/ticketeria-backend:latest
docker push gcr.io/$PROJECT_ID/ticketeria-frontend:latest

# 4. Verificar imagens
gcloud container images list --repository=gcr.io/$PROJECT_ID
```

### Deploy da Aplicação

```bash
# 1. Conectar ao cluster (se usando GKE)
gcloud container clusters get-credentials ticketeria-cluster --region=$REGION

# 2. Deploy via Compute Engine (método atual)
# As instâncias irão automaticamente fazer pull das novas imagens

# 3. Verificar deploy
gcloud compute instances list
gcloud compute instance-groups list
```

## Configurações por Ambiente

### Desenvolvimento

```env
# backend/.env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticketeria
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://admin:admin@localhost:5672
JWT_SECRET=dev-secret-key
SQALA_API_KEY=test_key
```

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Ticketeria Dev
NODE_ENV=development
```

### Staging

```env
# backend/.env
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@staging-db:5432/ticketeria
REDIS_URL=redis://staging-redis:6379
RABBITMQ_URL=amqp://user:pass@staging-rabbitmq:5672
JWT_SECRET=staging-secret-key
SQALA_API_KEY=staging_key
```

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api-staging.ticketeria.com
NEXT_PUBLIC_APP_NAME=Ticketeria Staging
NODE_ENV=staging
```

### Produção

```env
# backend/.env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/ticketeria
REDIS_URL=redis://prod-redis:6379
RABBITMQ_URL=amqp://user:pass@prod-rabbitmq:5672
JWT_SECRET=super-secure-production-key
SQALA_API_KEY=production_key
```

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.ticketeria.com
NEXT_PUBLIC_APP_NAME=Ticketeria
NODE_ENV=production
```

## Estratégias de Deploy

### Blue-Green Deployment

```bash
# 1. Deploy da nova versão (Green)
terraform apply -var="deployment_color=green"

# 2. Testar nova versão
curl https://green.ticketeria.com/health

# 3. Trocar tráfego
terraform apply -var="active_deployment=green"

# 4. Verificar produção
curl https://ticketeria.com/health

# 5. Remover versão antiga (Blue)
terraform apply -var="cleanup_blue=true"
```

### Rolling Update

```bash
# 1. Atualizar instance template
gcloud compute instance-templates create ticketeria-template-v2 \
  --image-family=ticketeria-image \
  --metadata=startup-script=startup-script.sh

# 2. Iniciar rolling update
gcloud compute instance-group-managers rolling-action start-update \
  ticketeria-igm \
  --version=template=ticketeria-template-v2 \
  --max-unavailable=1

# 3. Monitorar progresso
gcloud compute instance-group-managers describe ticketeria-igm
```

### Canary Deployment

```bash
# 1. Deploy canary (10% do tráfego)
terraform apply -var="canary_percentage=10"

# 2. Monitorar métricas
gcloud logging read "resource.type=gce_instance AND labels.instance_name:canary"

# 3. Aumentar tráfego gradualmente
terraform apply -var="canary_percentage=50"
terraform apply -var="canary_percentage=100"
```

## Monitoramento de Deploy

### Health Checks

```bash
# Backend health check
curl -f http://localhost:3001/health || exit 1

# Frontend health check
curl -f http://localhost:3000 || exit 1

# Database connectivity
curl -f http://localhost:3001/health/database || exit 1
```

### Smoke Tests

```bash
#!/bin/bash
# scripts/smoke-tests.sh

BASE_URL=${1:-http://localhost:3001}

echo "Running smoke tests against $BASE_URL"

# Test 1: Health endpoint
echo "Testing health endpoint..."
curl -f $BASE_URL/health || exit 1

# Test 2: Authentication
echo "Testing authentication..."
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.access_token')

if [ "$TOKEN" = "null" ]; then
  echo "Authentication failed"
  exit 1
fi

# Test 3: Events endpoint
echo "Testing events endpoint..."
curl -f -H "Authorization: Bearer $TOKEN" $BASE_URL/events || exit 1

echo "All smoke tests passed!"
```

### Métricas de Deploy

```typescript
// src/monitoring/deploy-metrics.ts
export class DeployMetrics {
  recordDeployStart(version: string): void {
    this.metrics.increment('deploy.started', { version });
  }

  recordDeploySuccess(version: string, duration: number): void {
    this.metrics.increment('deploy.success', { version });
    this.metrics.histogram('deploy.duration', duration, { version });
  }

  recordDeployFailure(version: string, error: string): void {
    this.metrics.increment('deploy.failure', { version, error });
  }
}
```

## Rollback

### Rollback Automático

```bash
#!/bin/bash
# scripts/auto-rollback.sh

HEALTH_URL="https://api.ticketeria.com/health"
MAX_RETRIES=5
RETRY_INTERVAL=30

for i in $(seq 1 $MAX_RETRIES); do
  if curl -f $HEALTH_URL; then
    echo "Health check passed"
    exit 0
  fi
  
  echo "Health check failed (attempt $i/$MAX_RETRIES)"
  sleep $RETRY_INTERVAL
done

echo "Health checks failed, initiating rollback..."
terraform apply -var="rollback=true" -auto-approve
```

### Rollback Manual

```bash
# 1. Identificar versão anterior
gcloud compute instance-templates list

# 2. Rollback via Terraform
terraform apply -var="instance_template=ticketeria-template-v1"

# 3. Rollback via gcloud
gcloud compute instance-group-managers rolling-action start-update \
  ticketeria-igm \
  --version=template=ticketeria-template-v1
```

### Rollback de Banco de Dados

```bash
# 1. Backup antes do deploy
pg_dump $DATABASE_URL > backup-pre-deploy.sql

# 2. Rollback de migração (se necessário)
npx prisma migrate reset

# 3. Restaurar backup
psql $DATABASE_URL < backup-pre-deploy.sql
```

## Backup e Restore

### Backup Automático

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
PROJECT_ID=$(gcloud config get-value project)

# Backup do banco de dados
gcloud sql export sql ticketeria-db \
  gs://ticketeria-backups/database/backup_$DATE.sql

# Backup de arquivos
gsutil -m cp -r gs://ticketeria-uploads \
  gs://ticketeria-backups/uploads/backup_$DATE/

# Backup de configurações
kubectl get configmaps -o yaml > $BACKUP_DIR/configmaps_$DATE.yaml
kubectl get secrets -o yaml > $BACKUP_DIR/secrets_$DATE.yaml

echo "Backup completed: $DATE"
```

### Restore

```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_DATE=$1
if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 <backup_date>"
  exit 1
fi

# Restore banco de dados
gcloud sql import sql ticketeria-db \
  gs://ticketeria-backups/database/backup_$BACKUP_DATE.sql

# Restore arquivos
gsutil -m cp -r gs://ticketeria-backups/uploads/backup_$BACKUP_DATE/ \
  gs://ticketeria-uploads/

echo "Restore completed from backup: $BACKUP_DATE"
```

## Segurança no Deploy

### Secrets Management

```bash
# 1. Criar secrets no Google Secret Manager
gcloud secrets create jwt-secret --data-file=jwt-secret.txt
gcloud secrets create database-password --data-file=db-password.txt

# 2. Dar permissões para as instâncias
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Network Security

```bash
# 1. Configurar firewall rules
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server

gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --target-tags https-server

# 2. Configurar SSL
gcloud compute ssl-certificates create ticketeria-ssl \
  --domains ticketeria.com,www.ticketeria.com
```

### Container Security

```dockerfile
# Dockerfile com security best practices
FROM node:18-alpine AS base

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copiar apenas arquivos necessários
COPY --chown=nextjs:nodejs package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Usar usuário não-root
USER nextjs

# Expor apenas porta necessária
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## Troubleshooting de Deploy

### Problemas Comuns

#### 1. Falha na Build da Imagem

```bash
# Verificar logs de build
docker build --no-cache -t ticketeria-backend .

# Verificar espaço em disco
df -h

# Limpar cache do Docker
docker system prune -a
```

#### 2. Falha no Health Check

```bash
# Verificar logs da aplicação
docker logs container_name

# Testar health check manualmente
curl -v http://localhost:3001/health

# Verificar conectividade com banco
docker exec -it container_name psql $DATABASE_URL
```

#### 3. Problemas de Rede

```bash
# Verificar conectividade
ping google.com

# Verificar DNS
nslookup api.ticketeria.com

# Verificar portas
netstat -tlnp | grep :3001
```

### Logs e Debugging

```bash
# Logs do Terraform
export TF_LOG=DEBUG
terraform apply

# Logs do Google Cloud
gcloud logging read "resource.type=gce_instance" --limit=50

# Logs da aplicação
kubectl logs -f deployment/ticketeria-backend
```

## Performance e Otimização

### Otimizações de Build

```dockerfile
# Multi-stage build para reduzir tamanho
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main"]
```

### Cache de Build

```bash
# Usar cache do Docker
docker build --cache-from ticketeria-backend:latest .

# Cache no CI/CD
docker pull ticketeria-backend:latest || true
docker build --cache-from ticketeria-backend:latest -t ticketeria-backend:$VERSION .
```

### Otimizações de Runtime

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Google Cloud
        uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Configure Docker
        run: gcloud auth configure-docker
      
      - name: Build and Push Images
        run: |
          docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/ticketeria-backend:${{ github.sha }} backend/
          docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/ticketeria-backend:${{ github.sha }}
      
      - name: Deploy Infrastructure
        run: |
          cd terraform
          terraform init
          terraform apply -auto-approve -var="image_tag=${{ github.sha }}"
      
      - name: Run Smoke Tests
        run: ./scripts/smoke-tests.sh https://api.ticketeria.com
```

Este guia cobre todos os aspectos essenciais do deploy da aplicação Ticketeria. Para situações específicas não cobertas aqui, consulte a documentação dos serviços utilizados ou entre em contato com a equipe de DevOps.

