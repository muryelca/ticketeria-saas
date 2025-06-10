#!/bin/bash

# Script de inicialização para as instâncias
set -e

# Atualizar sistema
apt-get update
apt-get upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Instalar Git
apt-get install -y git

# Instalar Nginx
apt-get install -y nginx

# Configurar Nginx como proxy reverso
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name _;

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

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
    }
}
EOF

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# Criar diretório para a aplicação
mkdir -p /opt/ticketeria
cd /opt/ticketeria

# Clonar repositório (substitua pela URL do seu repositório)
# git clone https://github.com/seu-usuario/ticketeria.git .

# Por enquanto, criar um docker-compose.yml básico
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  app:
    image: nginx:alpine
    ports:
      - "3000:80"
    volumes:
      - ./html:/usr/share/nginx/html
EOF

# Criar página de teste
mkdir -p html
cat > html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Ticketeria - Em Breve</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
        h1 { color: #1976d2; }
    </style>
</head>
<body>
    <h1>Ticketeria</h1>
    <p>Sistema de venda de ingressos em desenvolvimento...</p>
    <p>Instância: $(hostname)</p>
</body>
</html>
EOF

# Iniciar aplicação
docker-compose up -d

# Log de conclusão
echo "Instância inicializada com sucesso!" > /var/log/startup-complete.log

