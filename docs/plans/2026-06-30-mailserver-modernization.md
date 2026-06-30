# Mail Server Modernization Implementation Plan

> **For Gemini:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize the Docker mailserver configuration on HTZNR by integrating Autoconfig/Autodiscover, encrypted remote backups using Restic, Prometheus monitoring exporters, and migrating to Rspamd.

**Architecture:** Extend `docker-compose.yml` with autoconfig and postfix-exporter containers, create a Restic backup helper script `backup-mail.sh`, and migrate `mailserver.env` to use Rspamd instead of SpamAssassin.

**Tech Stack:** docker-mailserver, wdes/mail-autodiscover-autoconfig, restic, kumina/postfix-exporter, rspamd.

---

### Task 1: Autoconfig & Autodiscover Integration

**Files:**
- Modify: `docker-compose.yml`

**Step 1: Write compose service addition**

Add the `autoconfig` service to the ports and services configuration in `docker-compose.yml`:
```yaml
  autoconfig:
    image: wdes/mail-autodiscover-autoconfig:latest
    container_name: mail-autoconfig
    restart: always
    environment:
      - COMPANY_NAME=Srvrs Mail
      - SUPPORT_URL=https://srvrs.top
      - IMAP_HOST=mail.srvrs.top
      - IMAP_PORT=993
      - IMAP_SOCKET=SSL
      - SMTP_HOST=mail.srvrs.top
      - SMTP_PORT=465
      - SMTP_SOCKET=SSL
    ports:
      - "127.0.0.1:8000:80"
```

**Step 2: Commit changes**

```bash
git add docker-compose.yml
git commit -m "feat: add autoconfig service to docker-compose"
```

---

### Task 2: Encrypted Remote Backups (Restic Setup)

**Files:**
- Create: `backup-mail.sh`
- Create: `.backup.env` (excluded by gitignore)

**Step 1: Write backup script**

Create `backup-mail.sh` with the following content:
```bash
#!/bin/bash
set -e
# Load environment
if [ -f .backup.env ]; then
  source .backup.env
fi

# Ensure RESTIC_REPOSITORY and RESTIC_PASSWORD_FILE are set
if [ -z "$RESTIC_REPOSITORY" ]; then
  echo "Error: RESTIC_REPOSITORY is not set"
  exit 1
fi

echo "Starting backup to $RESTIC_REPOSITORY..."
restic backup \
  ./docker-data/mail-data \
  ./docker-data/config \
  ./mailserver.env \
  ./docker-compose.yml

echo "Cleaning up old snapshots..."
restic forget --keep-daily 7 --keep-weekly 4 --prune
echo "Backup completed successfully!"
```

**Step 2: Commit changes**

```bash
chmod +x backup-mail.sh
git add backup-mail.sh
git commit -m "feat: add Restic backup script"
```

---

### Task 3: Prometheus Monitoring Exporter

**Files:**
- Modify: `docker-compose.yml`

**Step 1: Add postfix-exporter service**

Add `postfix-exporter` to `docker-compose.yml` to parse logs and export mail metrics:
```yaml
  postfix-exporter:
    image: kumina/postfix-exporter:latest
    container_name: mail-postfix-exporter
    restart: always
    volumes:
      - ./docker-data/mail-logs:/var/log/mail:ro
    ports:
      - "127.0.0.1:9154:9154"
```

**Step 2: Commit changes**

```bash
git add docker-compose.yml
git commit -m "feat: add postfix-exporter monitoring service"
```

---

### Task 4: Rspamd Migration

**Files:**
- Modify: `mailserver.env`

**Step 1: Change filtering module variables**

Modify `mailserver.env` to disable SpamAssassin and enable Rspamd:
```env
ENABLE_SPAMASSASSIN=0
ENABLE_RSPAMD=1
```

**Step 2: Commit changes**

```bash
git add mailserver.env
git commit -m "feat: migrate filtering from SpamAssassin to Rspamd"
```
