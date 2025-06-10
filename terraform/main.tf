# Configuração principal do Terraform
module "networking" {
  source = "./modules/networking"

  project_id           = var.project_id
  region              = var.region
  environment         = var.environment
  app_name            = var.app_name
  vpc_cidr            = var.vpc_cidr
  public_subnet_cidr  = var.public_subnet_cidr
  private_subnet_cidr = var.private_subnet_cidr
  domain_name         = var.domain_name
  ssl_certificate_name = var.ssl_certificate_name
}

module "database" {
  source = "./modules/database"

  project_id       = var.project_id
  region          = var.region
  environment     = var.environment
  app_name        = var.app_name
  instance_tier   = var.db_instance_tier
  database_name   = var.db_name
  database_user   = var.db_user
  database_password = var.db_password
  vpc_network     = module.networking.vpc_network_name
  private_subnet  = module.networking.private_subnet_name
}

module "storage" {
  source = "./modules/storage"

  project_id  = var.project_id
  region     = var.region
  environment = var.environment
  app_name   = var.app_name
}

module "compute" {
  source = "./modules/compute"

  project_id              = var.project_id
  region                 = var.region
  zone                   = var.zone
  environment            = var.environment
  app_name               = var.app_name
  machine_type           = var.machine_type
  min_replicas           = var.min_replicas
  max_replicas           = var.max_replicas
  vpc_network            = module.networking.vpc_network_name
  public_subnet          = module.networking.public_subnet_name
  database_connection_name = module.database.connection_name
  database_private_ip    = module.database.private_ip_address
  storage_bucket_name    = module.storage.bucket_name
  target_pool            = module.networking.target_pool_name
}

