#!/bin/bash

# Script para inicializar o ambiente de desenvolvimento

echo "🚀 Inicializando ambiente de desenvolvimento da Ticketeria..."

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
docker-compose -f docker-compose.dev.yml down

# Iniciar serviços de infraestrutura
echo "🔧 Iniciando serviços de infraestrutura (PostgreSQL, RabbitMQ, Redis)..."
docker-compose -f docker-compose.dev.yml up -d

# Aguardar os serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar se os serviços estão rodando
echo "✅ Verificando status dos serviços..."
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "🎉 Ambiente de desenvolvimento inicializado com sucesso!"
echo ""
echo "📋 Serviços disponíveis:"
echo "   - PostgreSQL: localhost:5432"
echo "   - RabbitMQ: localhost:5672 (Management: http://localhost:15672)"
echo "   - Redis: localhost:6379"
echo ""
echo "🔧 Para iniciar o backend:"
echo "   cd backend/ticketeria-api"
echo "   npm install"
echo "   npx prisma migrate dev"
echo "   npm run start:dev"
echo ""
echo "🎨 Para iniciar o frontend:"
echo "   cd frontend"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "🛑 Para parar os serviços:"
echo "   docker-compose -f docker-compose.dev.yml down"

