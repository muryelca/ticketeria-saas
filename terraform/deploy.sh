#!/bin/bash

# Script para deploy no Google Cloud Platform
set -e

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo "Uso: $0 <environment> [action]"
    echo "Environments: dev, prod"
    echo "Actions: plan, apply, destroy (default: plan)"
    exit 1
fi

ENVIRONMENT=$1
ACTION=${2:-plan}

# Verificar se o ambiente é válido
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
    echo "❌ Ambiente inválido. Use 'dev' ou 'prod'"
    exit 1
fi

# Verificar se o Terraform está instalado
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform não está instalado. Por favor, instale o Terraform primeiro."
    exit 1
fi

# Verificar se o gcloud está instalado e autenticado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK não está instalado. Por favor, instale o gcloud primeiro."
    exit 1
fi

# Verificar autenticação
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Você não está autenticado no Google Cloud. Execute: gcloud auth login"
    exit 1
fi

echo "🚀 Iniciando deploy no ambiente: $ENVIRONMENT"
echo "📋 Ação: $ACTION"

# Navegar para o diretório do Terraform
cd "$(dirname "$0")"

# Inicializar Terraform
echo "🔧 Inicializando Terraform..."
terraform init

# Selecionar workspace
echo "🔄 Selecionando workspace: $ENVIRONMENT"
terraform workspace select $ENVIRONMENT || terraform workspace new $ENVIRONMENT

# Executar ação
case $ACTION in
    plan)
        echo "📋 Executando terraform plan..."
        terraform plan -var-file="environments/$ENVIRONMENT/terraform.tfvars"
        ;;
    apply)
        echo "🚀 Executando terraform apply..."
        terraform apply -var-file="environments/$ENVIRONMENT/terraform.tfvars" -auto-approve
        
        echo ""
        echo "✅ Deploy concluído com sucesso!"
        echo ""
        echo "📊 Outputs:"
        terraform output
        ;;
    destroy)
        echo "⚠️  ATENÇÃO: Esta operação irá DESTRUIR todos os recursos!"
        read -p "Tem certeza que deseja continuar? (digite 'yes' para confirmar): " -r
        if [[ $REPLY == "yes" ]]; then
            echo "🗑️  Executando terraform destroy..."
            terraform destroy -var-file="environments/$ENVIRONMENT/terraform.tfvars" -auto-approve
            echo "✅ Recursos destruídos com sucesso!"
        else
            echo "❌ Operação cancelada."
            exit 1
        fi
        ;;
    *)
        echo "❌ Ação inválida. Use: plan, apply, ou destroy"
        exit 1
        ;;
esac

echo ""
echo "🎉 Operação concluída!"

