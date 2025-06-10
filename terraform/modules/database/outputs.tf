output "connection_name" {
  description = "Nome da conexão do Cloud SQL"
  value       = google_sql_database_instance.postgres.connection_name
}

output "private_ip_address" {
  description = "IP privado do banco de dados"
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "public_ip_address" {
  description = "IP público do banco de dados"
  value       = google_sql_database_instance.postgres.public_ip_address
}

output "database_name" {
  description = "Nome do banco de dados"
  value       = google_sql_database.database.name
}

output "database_user" {
  description = "Usuário do banco de dados"
  value       = google_sql_user.user.name
}

output "root_password" {
  description = "Senha do usuário root"
  value       = random_password.root_password.result
  sensitive   = true
}

output "ssl_cert" {
  description = "Certificado SSL do cliente"
  value       = google_sql_ssl_cert.client_cert.cert
  sensitive   = true
}

output "ssl_cert_private_key" {
  description = "Chave privada do certificado SSL"
  value       = google_sql_ssl_cert.client_cert.private_key
  sensitive   = true
}

output "ssl_cert_server_ca" {
  description = "Certificado CA do servidor"
  value       = google_sql_ssl_cert.client_cert.server_ca_cert
  sensitive   = true
}

