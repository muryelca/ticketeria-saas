# Configuração para ambiente de desenvolvimento
project_id = "your-gcp-project-id"
region     = "us-central1"
zone       = "us-central1-a"
environment = "dev"

# Configurações de rede
vpc_cidr            = "10.0.0.0/16"
public_subnet_cidr  = "10.0.1.0/24"
private_subnet_cidr = "10.0.2.0/24"

# Configurações de banco de dados
db_instance_tier = "db-f1-micro"
db_name         = "ticketeria"
db_user         = "postgres"
db_password     = "dev-password-change-me"

# Configurações de compute
machine_type  = "e2-micro"
min_replicas  = 1
max_replicas  = 2

# Domínio (opcional para dev)
domain_name = ""
ssl_certificate_name = ""

