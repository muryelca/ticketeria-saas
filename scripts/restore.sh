#!/bin/bash

# Script para restaurar backup do banco de dados

if [ $# -eq 0 ]; then
    echo "❌ Uso: $0 <arquivo_backup.sql.gz>"
    echo "Exemplo: $0 ./backups/ticketeria_backup_20241208_143000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Iniciando restauração do backup: $BACKUP_FILE"

# Verificar se o container do PostgreSQL está rodando
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ Container do PostgreSQL não está rodando."
    echo "Execute: docker-compose up -d postgres"
    exit 1
fi

# Confirmar a restauração
read -p "⚠️  ATENÇÃO: Esta operação irá SOBRESCREVER todos os dados existentes. Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada."
    exit 1
fi

# Parar o backend para evitar conexões ativas
echo "🛑 Parando backend..."
docker-compose stop backend

# Descomprimir e restaurar
echo "📦 Restaurando backup..."
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker-compose exec -T postgres psql -U postgres -d ticketeria
else
    cat "$BACKUP_FILE" | docker-compose exec -T postgres psql -U postgres -d ticketeria
fi

if [ $? -eq 0 ]; then
    echo "✅ Backup restaurado com sucesso!"
    
    # Reiniciar o backend
    echo "🚀 Reiniciando backend..."
    docker-compose start backend
    
    echo "🎉 Restauração concluída com sucesso!"
else
    echo "❌ Erro ao restaurar backup."
    
    # Reiniciar o backend mesmo em caso de erro
    echo "🚀 Reiniciando backend..."
    docker-compose start backend
    
    exit 1
fi

