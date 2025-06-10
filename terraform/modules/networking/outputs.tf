output "vpc_network_name" {
  description = "Nome da rede VPC"
  value       = google_compute_network.vpc.name
}

output "vpc_network_id" {
  description = "ID da rede VPC"
  value       = google_compute_network.vpc.id
}

output "public_subnet_name" {
  description = "Nome da subnet pública"
  value       = google_compute_subnetwork.public_subnet.name
}

output "private_subnet_name" {
  description = "Nome da subnet privada"
  value       = google_compute_subnetwork.private_subnet.name
}

output "load_balancer_ip" {
  description = "IP do Load Balancer"
  value       = google_compute_global_address.global_ip.address
}

output "target_pool_name" {
  description = "Nome do target pool"
  value       = google_compute_target_pool.target_pool.name
}

