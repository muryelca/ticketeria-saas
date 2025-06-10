# Módulo de Compute
variable "project_id" {
  description = "ID do projeto no Google Cloud"
  type        = string
}

variable "region" {
  description = "Região do Google Cloud"
  type        = string
}

variable "zone" {
  description = "Zona do Google Cloud"
  type        = string
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
}

variable "app_name" {
  description = "Nome da aplicação"
  type        = string
}

variable "machine_type" {
  description = "Tipo de máquina para as instâncias"
  type        = string
}

variable "min_replicas" {
  description = "Número mínimo de réplicas"
  type        = number
}

variable "max_replicas" {
  description = "Número máximo de réplicas"
  type        = number
}

variable "vpc_network" {
  description = "Nome da rede VPC"
  type        = string
}

variable "public_subnet" {
  description = "Nome da subnet pública"
  type        = string
}

variable "database_connection_name" {
  description = "Nome da conexão do Cloud SQL"
  type        = string
}

variable "database_private_ip" {
  description = "IP privado do banco de dados"
  type        = string
}

variable "storage_bucket_name" {
  description = "Nome do bucket de storage"
  type        = string
}

variable "target_pool" {
  description = "Nome do target pool"
  type        = string
}

