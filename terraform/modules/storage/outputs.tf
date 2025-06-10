output "bucket_name" {
  description = "Nome do bucket principal"
  value       = google_storage_bucket.static_files.name
}

output "static_files_bucket_name" {
  description = "Nome do bucket de arquivos estáticos"
  value       = google_storage_bucket.static_files.name
}

output "user_uploads_bucket_name" {
  description = "Nome do bucket de uploads de usuários"
  value       = google_storage_bucket.user_uploads.name
}

output "backups_bucket_name" {
  description = "Nome do bucket de backups"
  value       = google_storage_bucket.backups.name
}

output "static_files_bucket_url" {
  description = "URL do bucket de arquivos estáticos"
  value       = google_storage_bucket.static_files.url
}

output "service_account_email" {
  description = "Email da service account"
  value       = google_service_account.app_service_account.email
}

output "service_account_key" {
  description = "Chave da service account (base64)"
  value       = google_service_account_key.app_service_account_key.private_key
  sensitive   = true
}

