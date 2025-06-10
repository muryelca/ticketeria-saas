# Instance Template
resource "google_compute_instance_template" "app_template" {
  name_prefix  = "${var.app_name}-${var.environment}-template-"
  machine_type = var.machine_type

  disk {
    source_image = "ubuntu-os-cloud/ubuntu-2004-lts"
    auto_delete  = true
    boot         = true
    disk_size_gb = var.environment == "prod" ? 50 : 20
    disk_type    = "pd-ssd"
  }

  network_interface {
    network    = var.vpc_network
    subnetwork = var.public_subnet

    access_config {
      // Ephemeral IP
    }
  }

  tags = ["http-server", "https-server", "ssh-server"]

  metadata = {
    startup-script = templatefile("${path.module}/startup-script.sh", {
      database_connection_name = var.database_connection_name
      database_private_ip     = var.database_private_ip
      storage_bucket_name     = var.storage_bucket_name
      environment            = var.environment
      app_name              = var.app_name
    })
  }

  service_account {
    email  = google_service_account.compute_service_account.email
    scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring.write",
    ]
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Instance Group Manager
resource "google_compute_instance_group_manager" "app_igm" {
  name = "${var.app_name}-${var.environment}-igm"
  zone = var.zone

  base_instance_name = "${var.app_name}-${var.environment}"
  target_size        = var.min_replicas

  version {
    instance_template = google_compute_instance_template.app_template.id
  }

  named_port {
    name = "http"
    port = 80
  }

  auto_healing_policies {
    health_check      = google_compute_health_check.app_health_check.id
    initial_delay_sec = 300
  }

  update_policy {
    type                         = "PROACTIVE"
    instance_redistribution_type = "PROACTIVE"
    minimal_action               = "REPLACE"
    max_surge_fixed              = 1
    max_unavailable_fixed        = 0
  }
}

# Autoscaler
resource "google_compute_autoscaler" "app_autoscaler" {
  name   = "${var.app_name}-${var.environment}-autoscaler"
  zone   = var.zone
  target = google_compute_instance_group_manager.app_igm.id

  autoscaling_policy {
    max_replicas    = var.max_replicas
    min_replicas    = var.min_replicas
    cooldown_period = 60

    cpu_utilization {
      target = 0.7
    }

    load_balancing_utilization {
      target = 0.8
    }
  }
}

# Health Check
resource "google_compute_health_check" "app_health_check" {
  name = "${var.app_name}-${var.environment}-health-check"

  timeout_sec        = 5
  check_interval_sec = 10
  healthy_threshold  = 2
  unhealthy_threshold = 3

  http_health_check {
    port         = 80
    request_path = "/health"
  }
}

# Service Account para as instâncias
resource "google_service_account" "compute_service_account" {
  account_id   = "${var.app_name}-${var.environment}-compute-sa"
  display_name = "Service Account para instâncias ${var.app_name} ${var.environment}"
  description  = "Service Account usado pelas instâncias de compute do ${var.app_name} no ambiente ${var.environment}"
}

# IAM roles para a service account
resource "google_project_iam_member" "compute_sa_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.compute_service_account.email}"
}

resource "google_project_iam_member" "compute_sa_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.compute_service_account.email}"
}

resource "google_project_iam_member" "compute_sa_logging_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.compute_service_account.email}"
}

resource "google_project_iam_member" "compute_sa_monitoring_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.compute_service_account.email}"
}

