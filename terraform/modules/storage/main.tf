# Cloud Storage Bucket para arquivos estáticos
resource "google_storage_bucket" "static_files" {
  name          = "${var.app_name}-${var.environment}-static-files-${random_id.bucket_suffix.hex}"
  location      = var.region
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  versioning {
    enabled = var.environment == "prod"
  }

  lifecycle_rule {
    condition {
      age = var.environment == "prod" ? 365 : 30
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Cloud Storage Bucket para uploads de usuários
resource "google_storage_bucket" "user_uploads" {
  name          = "${var.app_name}-${var.environment}-user-uploads-${random_id.bucket_suffix.hex}"
  location      = var.region
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  versioning {
    enabled = var.environment == "prod"
  }

  lifecycle_rule {
    condition {
      age = var.environment == "prod" ? 90 : 30
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Cloud Storage Bucket para backups
resource "google_storage_bucket" "backups" {
  name          = "${var.app_name}-${var.environment}-backups-${random_id.bucket_suffix.hex}"
  location      = var.region
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = var.environment == "prod" ? 2555 : 90  # 7 anos para prod, 90 dias para dev
    }
    action {
      type = "Delete"
    }
  }

  lifecycle_rule {
    condition {
      age                = 30
      matches_storage_class = ["STANDARD"]
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age                = 90
      matches_storage_class = ["NEARLINE"]
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }
}

# Random ID para sufixo dos buckets
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# IAM para acesso público aos arquivos estáticos
resource "google_storage_bucket_iam_member" "static_files_public" {
  bucket = google_storage_bucket.static_files.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Service Account para a aplicação
resource "google_service_account" "app_service_account" {
  account_id   = "${var.app_name}-${var.environment}-sa"
  display_name = "Service Account para ${var.app_name} ${var.environment}"
  description  = "Service Account usado pela aplicação ${var.app_name} no ambiente ${var.environment}"
}

# IAM para a service account acessar os buckets
resource "google_storage_bucket_iam_member" "app_static_files" {
  bucket = google_storage_bucket.static_files.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.app_service_account.email}"
}

resource "google_storage_bucket_iam_member" "app_user_uploads" {
  bucket = google_storage_bucket.user_uploads.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.app_service_account.email}"
}

resource "google_storage_bucket_iam_member" "app_backups" {
  bucket = google_storage_bucket.backups.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.app_service_account.email}"
}

# Chave da service account
resource "google_service_account_key" "app_service_account_key" {
  service_account_id = google_service_account.app_service_account.name
}

