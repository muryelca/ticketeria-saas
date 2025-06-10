# Módulo de Storage
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

