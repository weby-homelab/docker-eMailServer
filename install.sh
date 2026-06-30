#!/bin/bash
set -e

echo "========================================="
echo "📧 Installing Docker eMailServer Stack"
echo "========================================="

# 1. Clone the repository if running outside of it
if [ ! -f docker-compose.yml ]; then
  echo "-> Cloning docker-eMailServer repository..."
  git clone https://github.com/weby-homelab/docker-eMailServer.git email-server
  cd email-server
fi

# 2. Create required persistent data directories
echo "-> Creating data, state, log, and config directories..."
mkdir -p docker-data/mail-data docker-data/mail-state docker-data/mail-logs docker-data/config

# 3. Verify environment configuration file
if [ ! -f mailserver.env ]; then
  echo "-> Creating default mailserver.env from template..."
  cp mailserver.env.example mailserver.env
  echo "-> Please edit mailserver.env with your domain and cert paths before running compose."
  exit 0
fi

# 4. Start Docker Compose services
echo "-> Launching Docker containers (mailserver, autoconfig, postfix-exporter)..."
docker compose up -d

echo "========================================="
echo "✅ Installation completed successfully!"
echo "========================================="
echo "To set up email accounts and generate DKIM keys, run:"
echo "  chmod +x setup-accounts.sh"
echo "  ./setup-accounts.sh"
echo "========================================="
