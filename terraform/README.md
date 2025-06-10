# Terraform para Google Cloud Platform

Este diretório contém a configuração do Terraform para deploy da aplicação Ticketeria no Google Cloud Platform.

## Estrutura

```
terraform/
├── main.tf                 # Configuração principal
├── variables.tf            # Variáveis globais
├── outputs.tf             # Outputs globais
├── providers.tf           # Configuração dos providers
├── backend.tf             # Configuração do backend remoto
├── deploy.sh              # Script de deploy
├── modules/               # Módulos do Terraform
│   ├── networking/        # VPC, subnets, load balancer
│   ├── database/          # Cloud SQL PostgreSQL
│   ├── storage/           # Cloud Storage buckets
│   └── compute/           # Compute Engine instances
└── environments/          # Configurações por ambiente
    ├── dev/
    └── prod/
```

## Recursos Criados

### Networking
- VPC personalizada com subnets públicas e privadas
- Cloud NAT para acesso à internet das instâncias privadas
- Load Balancer HTTP(S) com health checks
- Regras de firewall para HTTP, HTTPS e SSH

### Database
- Cloud SQL PostgreSQL com alta disponibilidade (prod)
- Backup automático e point-in-time recovery
- Conexão privada via VPC peering
- SSL obrigatório

### Storage
- Buckets para arquivos estáticos, uploads e backups
- Lifecycle policies para otimização de custos
- Service accounts com permissões adequadas

### Compute
- Instance templates com startup scripts
- Managed Instance Groups com autoscaling
- Health checks para alta disponibilidade
- Integração com Cloud SQL e Storage

## Pré-requisitos

1. **Google Cloud SDK**
   ```bash
   # Instalar gcloud
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. **Terraform**
   ```bash
   # Instalar Terraform
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

3. **Configuração do GCP**
   ```bash
   # Executar script de configuração
   ./scripts/setup-gcp.sh
   ```

## Como Usar

### 1. Configuração Inicial

```bash
# Configurar Google Cloud Platform
./scripts/setup-gcp.sh

# Navegar para o diretório do Terraform
cd terraform
```

### 2. Configurar Variáveis

Edite os arquivos em `environments/` com suas configurações:

```bash
# Desenvolvimento
vim environments/dev/terraform.tfvars

# Produção
vim environments/prod/terraform.tfvars
```

### 3. Deploy

```bash
# Planejar deploy (desenvolvimento)
./deploy.sh dev plan

# Aplicar deploy (desenvolvimento)
./deploy.sh dev apply

# Planejar deploy (produção)
./deploy.sh prod plan

# Aplicar deploy (produção)
./deploy.sh prod apply
```

### 4. Verificar Deploy

```bash
# Ver outputs
terraform output

# Verificar recursos criados
gcloud compute instances list
gcloud sql instances list
gcloud storage buckets list
```

## Configurações por Ambiente

### Desenvolvimento
- Instâncias menores (e2-micro)
- Banco de dados básico (db-f1-micro)
- 1-2 réplicas
- Sem alta disponibilidade
- Backups por 7 dias

### Produção
- Instâncias maiores (e2-standard-2)
- Banco de dados com alta disponibilidade
- 2-10 réplicas com autoscaling
- SSL/TLS obrigatório
- Backups por 30 dias
- Monitoramento avançado

## Monitoramento

Os recursos incluem:
- Health checks automáticos
- Logs centralizados no Cloud Logging
- Métricas no Cloud Monitoring
- Alertas para falhas de saúde

## Segurança

- Comunicação criptografada (SSL/TLS)
- Rede privada para banco de dados
- Service accounts com permissões mínimas
- Firewall rules restritivas
- Backup automático criptografado

## Custos

### Desenvolvimento (estimativa mensal)
- Compute Engine: ~$15-30
- Cloud SQL: ~$10-20
- Storage: ~$1-5
- Load Balancer: ~$18
- **Total: ~$44-73/mês**

### Produção (estimativa mensal)
- Compute Engine: ~$100-300
- Cloud SQL: ~$50-150
- Storage: ~$5-20
- Load Balancer: ~$18
- **Total: ~$173-488/mês**

## Troubleshooting

### Problemas Comuns

1. **Erro de autenticação**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

2. **APIs não habilitadas**
   ```bash
   ./scripts/setup-gcp.sh
   ```

3. **Quotas insuficientes**
   - Verificar quotas no Console do GCP
   - Solicitar aumento se necessário

4. **Instâncias não inicializando**
   ```bash
   # Verificar logs de startup
   gcloud compute instances get-serial-port-output INSTANCE_NAME
   ```

### Logs Úteis

```bash
# Logs das instâncias
gcloud logging read "resource.type=gce_instance"

# Logs do Load Balancer
gcloud logging read "resource.type=http_load_balancer"

# Logs do Cloud SQL
gcloud logging read "resource.type=cloudsql_database"
```

## Limpeza

Para remover todos os recursos:

```bash
# CUIDADO: Isso irá deletar TUDO!
./deploy.sh dev destroy
./deploy.sh prod destroy
```

## Suporte

Para problemas ou dúvidas:
1. Verificar logs no Cloud Console
2. Consultar documentação do Terraform
3. Verificar status dos serviços do GCP

