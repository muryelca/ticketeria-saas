# Outputs principais
output "load_balancer_ip" {
  description = "IP do Load Balancer"
  value       = module.networking.load_balancer_ip
}

output "database_connection_name" {
  description = "Nome da conexão do Cloud SQL"
  value       = module.database.connection_name
}

output "database_private_ip" {
  description = "IP privado do banco de dados"
  value       = module.database.private_ip_address
}

output "storage_bucket_name" {
  description = "Nome do bucket de storage"
  value       = module.storage.bucket_name
}

output "vpc_network_name" {
  description = "Nome da rede VPC"
  value       = module.networking.vpc_network_name
}

output "instance_group_manager_name" {
  description = "Nome do Instance Group Manager"
  value       = module.compute.instance_group_manager_name
}

output "application_url" {
  description = "URL da aplicação"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${module.networking.load_balancer_ip}"
}

