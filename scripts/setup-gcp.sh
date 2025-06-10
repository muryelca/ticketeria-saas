#!/bin/bash

# Script para configurar o ambiente do Google Cloud Platform
set -e

echo "🔧 Configurando ambiente do Google Cloud Platform..."

# Verificar se o gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK não está instalado."
    echo "📥 Instale em: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar se o usuário está autenticado
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "🔐 Fazendo login no Google Cloud..."
    gcloud auth login
fi

# Solicitar ID do projeto
read -p "📝 Digite o ID do seu projeto no Google Cloud: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ ID do projeto é obrigatório."
    exit 1
fi

# Configurar projeto padrão
echo "🔧 Configurando projeto padrão: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Verificar se o projeto existe
if ! gcloud projects describe $PROJECT_ID &> /dev/null; then
    echo "❌ Projeto $PROJECT_ID não encontrado ou você não tem acesso."
    exit 1
fi

# Habilitar APIs necessárias
echo "🔌 Habilitando APIs necessárias..."
gcloud services enable compute.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable servicenetworking.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configurar autenticação para Docker
echo "🐳 Configurando autenticação do Docker para Google Container Registry..."
gcloud auth configure-docker

# Criar bucket para o estado do Terraform (opcional)
read -p "🗄️  Deseja criar um bucket para armazenar o estado do Terraform? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    BUCKET_NAME="${PROJECT_ID}-terraform-state"
    echo "📦 Criando bucket: $BUCKET_NAME"
    
    if ! gsutil ls gs://$BUCKET_NAME &> /dev/null; then
        gsutil mb gs://$BUCKET_NAME
        gsutil versioning set on gs://$BUCKET_NAME
        echo "✅ Bucket criado e versionamento habilitado."
        
        # Atualizar backend.tf
        sed -i "s/your-terraform-state-bucket/$BUCKET_NAME/g" terraform/backend.tf
        sed -i 's/# terraform {/terraform {/g' terraform/backend.tf
        sed -i 's/#   backend/  backend/g' terraform/backend.tf
        sed -i 's/#     bucket/    bucket/g' terraform/backend.tf
        sed -i 's/#     prefix/    prefix/g' terraform/backend.tf
        sed -i 's/# }/}/g' terraform/backend.tf
        
        echo "📝 Arquivo backend.tf atualizado."
    else
        echo "ℹ️  Bucket já existe."
    fi
fi

# Atualizar arquivos de configuração com o PROJECT_ID
echo "📝 Atualizando arquivos de configuração..."
sed -i "s/your-gcp-project-id/$PROJECT_ID/g" terraform/environments/dev/terraform.tfvars
sed -i "s/your-gcp-project-id/$PROJECT_ID/g" terraform/environments/prod/terraform.tfvars

# Criar service account para o Terraform (opcional)
read -p "👤 Deseja criar uma service account para o Terraform? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    SA_NAME="terraform-sa"
    SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    echo "👤 Criando service account: $SA_NAME"
    
    if ! gcloud iam service-accounts describe $SA_EMAIL &> /dev/null; then
        gcloud iam service-accounts create $SA_NAME \
            --display-name="Terraform Service Account" \
            --description="Service Account para execução do Terraform"
        
        # Adicionar roles necessárias
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$SA_EMAIL" \
            --role="roles/editor"
        
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$SA_EMAIL" \
            --role="roles/iam.serviceAccountAdmin"
        
        # Criar e baixar chave
        gcloud iam service-accounts keys create terraform-key.json \
            --iam-account=$SA_EMAIL
        
        echo "🔑 Chave da service account salva em: terraform-key.json"
        echo "📝 Para usar, execute: export GOOGLE_APPLICATION_CREDENTIALS=\$(pwd)/terraform-key.json"
    else
        echo "ℹ️  Service account já existe."
    fi
fi

echo ""
echo "✅ Configuração do Google Cloud Platform concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Revise e ajuste as configurações em terraform/environments/"
echo "2. Execute: cd terraform && ./deploy.sh dev plan"
echo "3. Se estiver tudo correto: ./deploy.sh dev apply"
echo ""
echo "🔧 Comandos úteis:"
echo "- Ver projetos: gcloud projects list"
echo "- Ver configuração atual: gcloud config list"
echo "- Trocar projeto: gcloud config set project PROJECT_ID"

