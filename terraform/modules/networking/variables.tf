# Módulo de Networking
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

variable "vpc_cidr" {
  description = "CIDR block para a VPC"
  type        = string
}

variable "public_subnet_cidr" {
  description = "CIDR block para a subnet pública"
  type        = string
}

variable "private_subnet_cidr" {
  description = "CIDR block para a subnet privada"
  type        = string
}

variable "domain_name" {
  description = "Nome do domínio"
  type        = string
}

variable "ssl_certificate_name" {
  description = "Nome do certificado SSL"
  type        = string
}

