# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "${var.app_name}-${var.environment}-vpc"
  auto_create_subnetworks = false
  routing_mode           = "REGIONAL"
}

# Public Subnet
resource "google_compute_subnetwork" "public_subnet" {
  name          = "${var.app_name}-${var.environment}-public-subnet"
  ip_cidr_range = var.public_subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/16"
  }
}

# Private Subnet
resource "google_compute_subnetwork" "private_subnet" {
  name          = "${var.app_name}-${var.environment}-private-subnet"
  ip_cidr_range = var.private_subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc.id
}

# Cloud Router
resource "google_compute_router" "router" {
  name    = "${var.app_name}-${var.environment}-router"
  region  = var.region
  network = google_compute_network.vpc.id
}

# Cloud NAT
resource "google_compute_router_nat" "nat" {
  name                               = "${var.app_name}-${var.environment}-nat"
  router                            = google_compute_router.router.name
  region                            = var.region
  nat_ip_allocate_option            = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Firewall Rules
resource "google_compute_firewall" "allow_http" {
  name    = "${var.app_name}-${var.environment}-allow-http"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server"]
}

resource "google_compute_firewall" "allow_https" {
  name    = "${var.app_name}-${var.environment}-allow-https"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["https-server"]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "${var.app_name}-${var.environment}-allow-ssh"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ssh-server"]
}

resource "google_compute_firewall" "allow_internal" {
  name    = "${var.app_name}-${var.environment}-allow-internal"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = [var.vpc_cidr]
}

# Health Check
resource "google_compute_health_check" "health_check" {
  name = "${var.app_name}-${var.environment}-health-check"

  timeout_sec        = 5
  check_interval_sec = 10

  http_health_check {
    port         = 80
    request_path = "/health"
  }
}

# Target Pool
resource "google_compute_target_pool" "target_pool" {
  name = "${var.app_name}-${var.environment}-target-pool"

  health_checks = [
    google_compute_health_check.health_check.name,
  ]
}

# Global IP Address
resource "google_compute_global_address" "global_ip" {
  name = "${var.app_name}-${var.environment}-global-ip"
}

# HTTP(S) Load Balancer
resource "google_compute_global_forwarding_rule" "http" {
  name       = "${var.app_name}-${var.environment}-http-forwarding-rule"
  target     = google_compute_target_http_proxy.http_proxy.id
  port_range = "80"
  ip_address = google_compute_global_address.global_ip.address
}

resource "google_compute_target_http_proxy" "http_proxy" {
  name    = "${var.app_name}-${var.environment}-http-proxy"
  url_map = google_compute_url_map.url_map.id
}

resource "google_compute_url_map" "url_map" {
  name            = "${var.app_name}-${var.environment}-url-map"
  default_service = google_compute_backend_service.backend_service.id
}

resource "google_compute_backend_service" "backend_service" {
  name        = "${var.app_name}-${var.environment}-backend-service"
  port_name   = "http"
  protocol    = "HTTP"
  timeout_sec = 30

  health_checks = [google_compute_health_check.health_check.id]

  backend {
    group = google_compute_instance_group_manager.instance_group_manager.instance_group
  }
}

# Instance Group Manager (será criado no módulo compute)
resource "google_compute_instance_group_manager" "instance_group_manager" {
  name = "${var.app_name}-${var.environment}-igm"

  base_instance_name = "${var.app_name}-${var.environment}"
  zone               = var.region

  version {
    instance_template = google_compute_instance_template.instance_template.id
  }

  target_size = 1

  named_port {
    name = "http"
    port = 80
  }

  auto_healing_policies {
    health_check      = google_compute_health_check.health_check.id
    initial_delay_sec = 300
  }
}

# Instance Template (será movido para o módulo compute)
resource "google_compute_instance_template" "instance_template" {
  name_prefix  = "${var.app_name}-${var.environment}-template-"
  machine_type = "e2-medium"

  disk {
    source_image = "ubuntu-os-cloud/ubuntu-2004-lts"
    auto_delete  = true
    boot         = true
    disk_size_gb = 20
  }

  network_interface {
    network    = google_compute_network.vpc.name
    subnetwork = google_compute_subnetwork.public_subnet.name

    access_config {
      // Ephemeral IP
    }
  }

  tags = ["http-server", "https-server"]

  metadata_startup_script = file("${path.module}/startup-script.sh")

  lifecycle {
    create_before_destroy = true
  }
}

# HTTPS Load Balancer (se certificado SSL for fornecido)
resource "google_compute_global_forwarding_rule" "https" {
  count      = var.ssl_certificate_name != "" ? 1 : 0
  name       = "${var.app_name}-${var.environment}-https-forwarding-rule"
  target     = google_compute_target_https_proxy.https_proxy[0].id
  port_range = "443"
  ip_address = google_compute_global_address.global_ip.address
}

resource "google_compute_target_https_proxy" "https_proxy" {
  count   = var.ssl_certificate_name != "" ? 1 : 0
  name    = "${var.app_name}-${var.environment}-https-proxy"
  url_map = google_compute_url_map.url_map.id

  ssl_certificates = [var.ssl_certificate_name]
}

