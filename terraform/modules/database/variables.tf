# Módulo de Database
variable "project_id" {
  description = "ID do projeto no Google Cloud"
  type        = string
}

variable "region" {
  description = "Região do Google Cloud"
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

variable "instance_tier" {
  description = "Tier da instância do Cloud SQL"
  type        = string
}

variable "database_name" {
  description = "Nome do banco de dados"
  type        = string
}

variable "database_user" {
  description = "Usuário do banco de dados"
  type        = string
}

variable "database_password" {
  description = "Senha do banco de dados"
  type        = string
  sensitive   = true
}

variable "vpc_network" {
  description = "Nome da rede VPC"
  type        = string
}

variable "private_subnet" {
  description = "Nome da subnet privada"
  type        = string
}

