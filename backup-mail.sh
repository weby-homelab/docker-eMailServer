#!/bin/bash
set -e

# Load environment variables for backup from .backup.env if it exists
if [ -f .backup.env ]; then
  source .backup.env
fi

# Validate parameters
if [ -z "$RESTIC_REPOSITORY" ]; then
  echo "Error: RESTIC_REPOSITORY environment variable is not set."
  echo "Please create a .backup.env file or set it in your environment."
  exit 1
fi

if [ -z "$RESTIC_PASSWORD" ] && [ -z "$RESTIC_PASSWORD_FILE" ]; then
  echo "Error: RESTIC_PASSWORD or RESTIC_PASSWORD_FILE is not set."
  exit 1
fi

echo "--- Starting Restic Backup for Docker eMailServer Stack ---"
restic backup \
  ./docker-data/mail-data \
  ./docker-data/config \
  ./mailserver.env \
  ./docker-compose.yml

echo "--- Running retention cleanup (forget & prune) ---"
# Retain last 7 daily, 4 weekly snapshots
restic forget --keep-daily 7 --keep-weekly 4 --prune

echo "--- Backup completed successfully! ---"
