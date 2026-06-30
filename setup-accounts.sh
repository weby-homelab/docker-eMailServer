#!/bin/bash
set -e

echo "Waiting for mailserver to start..."
sleep 10

echo "Adding contact@srvrs.top account..."
# Note: In a real deploy, the user should change this via the setup tool later or provide it via ENV.
docker exec -ti mailserver setup email add contact@srvrs.top "ChangeMeInProd123!"

echo "Generating DKIM keys..."
docker exec -ti mailserver setup config dkim

echo "Setup complete. Please check ./docker-data/config/opendkim/keys/ for DNS records."