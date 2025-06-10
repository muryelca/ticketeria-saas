#!/bin/bash

# Script para build e deploy da aplicação completa

echo "🚀 Iniciando build e deploy da Ticketeria..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Remover imagens antigas (opcional)
read -p "🗑️  Deseja remover imagens antigas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removendo imagens antigas..."
    docker-compose down --rmi all
fi

# Build das imagens
echo "🔨 Fazendo build das imagens..."
docker-compose build --no-cache

# Iniciar todos os serviços
echo "🚀 Iniciando todos os serviços..."
docker-compose up -d

# Aguardar os serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 30

# Verificar se os serviços estão rodando
echo "✅ Verificando status dos serviços..."
docker-compose ps

echo ""
echo "🎉 Deploy realizado com sucesso!"
echo ""
echo "📋 Serviços disponíveis:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - PostgreSQL: localhost:5432"
echo "   - RabbitMQ Management: http://localhost:15672 (admin/admin)"
echo "   - Redis: localhost:6379"
echo ""
echo "📊 Para ver logs:"
echo "   docker-compose logs -f [service_name]"
echo ""
echo "🛑 Para parar todos os serviços:"
echo "   docker-compose down"

