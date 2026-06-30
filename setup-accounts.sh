#!/bin/bash
set -e

# Load environment to get domain
if [ -f mailserver.env ]; then
  source mailserver.env
fi

DOMAIN="${DOMAIN_NAME:-example.com}"
ADMIN_EMAIL="contact@${DOMAIN}"

echo "Waiting for mailserver to start..."
sleep 10

echo "Adding ${ADMIN_EMAIL} account..."
# Note: In a real deploy, the user should change this via the setup tool later or provide it via ENV.
docker exec -ti mailserver setup email add "${ADMIN_EMAIL}" "ChangeMeInProd123!"

echo "Generating DKIM keys..."
docker exec -ti mailserver setup config dkim

echo "Setup complete. Please check ./docker-data/config/opendkim/keys/ for DNS records."