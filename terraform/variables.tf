# Variáveis principais
variable "project_id" {
  description = "ID do projeto no Google Cloud"
  type        = string
}

variable "region" {
  description = "Região do Google Cloud"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zona do Google Cloud"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "app_name" {
  description = "Nome da aplicação"
  type        = string
  default     = "ticketeria"
}

# Variáveis de rede
variable "vpc_cidr" {
  description = "CIDR block para a VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block para a subnet pública"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR block para a subnet privada"
  type        = string
  default     = "10.0.2.0/24"
}

# Variáveis de banco de dados
variable "db_instance_tier" {
  description = "Tier da instância do Cloud SQL"
  type        = string
  default     = "db-f1-micro"
}

variable "db_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "ticketeria"
}

variable "db_user" {
  description = "Usuário do banco de dados"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Senha do banco de dados"
  type        = string
  sensitive   = true
}

# Variáveis de compute
variable "machine_type" {
  description = "Tipo de máquina para as instâncias"
  type        = string
  default     = "e2-medium"
}

variable "min_replicas" {
  description = "Número mínimo de réplicas"
  type        = number
  default     = 1
}

variable "max_replicas" {
  description = "Número máximo de réplicas"
  type        = number
  default     = 3
}

# Variáveis de domínio
variable "domain_name" {
  description = "Nome do domínio"
  type        = string
  default     = ""
}

variable "ssl_certificate_name" {
  description = "Nome do certificado SSL"
  type        = string
  default     = ""
}

