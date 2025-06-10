output "instance_group_manager_name" {
  description = "Nome do Instance Group Manager"
  value       = google_compute_instance_group_manager.app_igm.name
}

output "instance_group_manager_id" {
  description = "ID do Instance Group Manager"
  value       = google_compute_instance_group_manager.app_igm.id
}

output "instance_template_name" {
  description = "Nome do template de instância"
  value       = google_compute_instance_template.app_template.name
}

output "service_account_email" {
  description = "Email da service account das instâncias"
  value       = google_service_account.compute_service_account.email
}

output "health_check_name" {
  description = "Nome do health check"
  value       = google_compute_health_check.app_health_check.name
}

output "autoscaler_name" {
  description = "Nome do autoscaler"
  value       = google_compute_autoscaler.app_autoscaler.name
}

