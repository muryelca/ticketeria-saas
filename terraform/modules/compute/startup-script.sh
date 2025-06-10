#!/bin/bash

# Script de inicialização para as instâncias de compute
set -e

# Variáveis do template
DATABASE_CONNECTION_NAME="${database_connection_name}"
DATABASE_PRIVATE_IP="${database_private_ip}"
STORAGE_BUCKET_NAME="${storage_bucket_name}"
ENVIRONMENT="${environment}"
APP_NAME="${app_name}"

# Log de início
echo "Iniciando configuração da instância para $APP_NAME - $ENVIRONMENT" > /var/log/startup.log

# Atualizar sistema
apt-get update
apt-get upgrade -y

# Instalar dependências
apt-get install -y \
    curl \
    wget \
    git \
    nginx \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Instalar Google Cloud SDK
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
apt-get update
apt-get install -y google-cloud-sdk

# Instalar Cloud SQL Proxy
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O /usr/local/bin/cloud_sql_proxy
chmod +x /usr/local/bin/cloud_sql_proxy

# Configurar Nginx
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name _;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Proxy para a aplicação
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Reiniciar e habilitar Nginx
systemctl restart nginx
systemctl enable nginx

# Criar diretório para a aplicação
mkdir -p /opt/ticketeria
cd /opt/ticketeria

# Configurar variáveis de ambiente
cat > .env << EOF
NODE_ENV=$ENVIRONMENT
DATABASE_URL="postgresql://postgres:password@$DATABASE_PRIVATE_IP:5432/ticketeria?schema=public"
GOOGLE_CLOUD_PROJECT_ID=$(curl -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/project/project-id)
STORAGE_BUCKET_NAME=$STORAGE_BUCKET_NAME
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="1d"
RABBITMQ_URL="amqp://admin:admin@localhost:5672"
REDIS_URL="redis://localhost:6379"
SQALA_API_KEY="your-sqala-api-key"
SQALA_API_URL="https://api.sqala.tech"
PORT=3000
EOF

# Criar docker-compose.yml para a aplicação
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # RabbitMQ
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: ticketeria-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    restart: unless-stopped

  # Redis
  redis:
    image: redis:7-alpine
    container_name: ticketeria-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

  # Backend API
  backend:
    image: gcr.io/PROJECT_ID/ticketeria-backend:latest
    container_name: ticketeria-backend
    env_file:
      - .env
    ports:
      - "3001:3000"
    depends_on:
      - rabbitmq
      - redis
    restart: unless-stopped

  # Frontend
  frontend:
    image: gcr.io/PROJECT_ID/ticketeria-frontend:latest
    container_name: ticketeria-frontend
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:3001"
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  rabbitmq_data:
  redis_data:
EOF

# Substituir PROJECT_ID no docker-compose.yml
PROJECT_ID=$(curl -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/project/project-id)
sed -i "s/PROJECT_ID/$PROJECT_ID/g" docker-compose.yml

# Configurar autenticação do Docker para GCR
gcloud auth configure-docker --quiet

# Criar serviço systemd para a aplicação
cat > /etc/systemd/system/ticketeria.service << 'EOF'
[Unit]
Description=Ticketeria Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ticketeria
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Habilitar o serviço
systemctl daemon-reload
systemctl enable ticketeria.service

# Iniciar Cloud SQL Proxy como serviço
cat > /etc/systemd/system/cloud-sql-proxy.service << EOF
[Unit]
Description=Google Cloud SQL Proxy
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/local/bin/cloud_sql_proxy -instances=$DATABASE_CONNECTION_NAME=tcp:5432
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cloud-sql-proxy.service
systemctl start cloud-sql-proxy.service

# Aguardar o Cloud SQL Proxy iniciar
sleep 10

# Tentar iniciar a aplicação (pode falhar se as imagens não existirem ainda)
systemctl start ticketeria.service || echo "Aplicação será iniciada quando as imagens estiverem disponíveis"

# Configurar logrotate
cat > /etc/logrotate.d/ticketeria << 'EOF'
/opt/ticketeria/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
EOF

# Criar script de deploy
cat > /opt/ticketeria/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "Iniciando deploy da aplicação..."

# Parar aplicação
docker-compose down

# Fazer pull das novas imagens
docker-compose pull

# Iniciar aplicação
docker-compose up -d

echo "Deploy concluído!"
EOF

chmod +x /opt/ticketeria/deploy.sh

# Log de conclusão
echo "Configuração da instância concluída com sucesso!" >> /var/log/startup.log
echo "$(date): Startup script completed" >> /var/log/startup.log

