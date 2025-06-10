#!/bin/bash

# Script para backup do banco de dados

echo "💾 Iniciando backup do banco de dados..."

# Configurações
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="ticketeria_backup_${DATE}.sql"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Verificar se o container do PostgreSQL está rodando
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ Container do PostgreSQL não está rodando."
    echo "Execute: docker-compose up -d postgres"
    exit 1
fi

# Fazer backup
echo "📦 Criando backup: $BACKUP_FILE"
docker-compose exec -T postgres pg_dump -U postgres ticketeria > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup criado com sucesso: $BACKUP_DIR/$BACKUP_FILE"
    
    # Comprimir o backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "🗜️  Backup comprimido: $BACKUP_DIR/$BACKUP_FILE.gz"
    
    # Manter apenas os últimos 7 backups
    echo "🧹 Limpando backups antigos (mantendo os últimos 7)..."
    ls -t $BACKUP_DIR/ticketeria_backup_*.sql.gz | tail -n +8 | xargs -r rm
    
    echo "🎉 Backup concluído com sucesso!"
else
    echo "❌ Erro ao criar backup."
    exit 1
fi

