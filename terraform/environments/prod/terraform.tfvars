# Configuração para ambiente de produção
project_id = "your-gcp-project-id"
region     = "us-central1"
zone       = "us-central1-a"
environment = "prod"

# Configurações de rede
vpc_cidr            = "10.0.0.0/16"
public_subnet_cidr  = "10.0.1.0/24"
private_subnet_cidr = "10.0.2.0/24"

# Configurações de banco de dados
db_instance_tier = "db-custom-2-4096"  # 2 vCPUs, 4GB RAM
db_name         = "ticketeria"
db_user         = "postgres"
db_password     = "super-secure-production-password"

# Configurações de compute
machine_type  = "e2-standard-2"  # 2 vCPUs, 8GB RAM
min_replicas  = 2
max_replicas  = 10

# Domínio e SSL
domain_name = "ticketeria.com"
ssl_certificate_name = "ticketeria-ssl-cert"

