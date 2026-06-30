# 📧 Docker eMailServer Stack

[EN](README.md) | [UA](README.ua.md)

This repository contains the configuration, scripts, and deployment files for running a secure, hardened mail server based on [docker-mailserver](https://github.com/docker-mailserver/docker-mailserver) on the HTZNR host.

---

## 📐 Architecture Overview

Below is the layout of the mail server stack and its interactions:

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef host fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef container fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;
    classDef config fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;

    subgraph Ext ["External Clients & Servers"]
        MUA["Mail Clients (Outlook, Thunderbird, iOS/Android)"]:::client
        Senders["External SMTP Servers (Gmail, Outlook, etc.)"]:::client
    end

    subgraph Host ["HTZNR Host OS"]
        Firewall["NFTables Firewall (Port Forwarding)"]:::host
        Certs["Let's Encrypt Certs (/etc/letsencrypt)"]:::config
    end

    subgraph DMS ["docker-mailserver Container"]
        Postfix["Postfix SMTP (Ports: 25, 465, 587)"]:::container
        Dovecot["Dovecot IMAPS (Port: 993)"]:::container
        SpamAssassin["SpamAssassin (Spam Filter)"]:::container
        Fail2Ban["Fail2Ban (Brute-force protection)"]:::container
        OpenDKIM["OpenDKIM (DKIM Signing)"]:::container
    end

    MUA -->|Ports: 465, 587, 993| Firewall
    Senders -->|Port: 25| Firewall

    Firewall -->|DNAT 25, 465, 587| Postfix
    Firewall -->|DNAT 993| Dovecot

    Postfix -->|Scan| SpamAssassin
    Postfix -->|Sign| OpenDKIM
    Dovecot -->|Log Auditing| Fail2Ban
    Postfix -->|Log Auditing| Fail2Ban

    Certs -->|Mounted read-only| Postfix
    Certs -->|Mounted read-only| Dovecot
```

---

## 🏗️ Project Structure

- **[docker-compose.yml](file:///root/geminicli/projects/mail-server/docker-compose.yml)**: Standard DMS service definitions, volume binds, and ports mappings.
- **[mailserver.env](file:///root/geminicli/projects/mail-server/mailserver.env)**: Environment variables tuning security parameters (TLS configs, enabled modules).
- **[setup-accounts.sh](file:///root/geminicli/projects/mail-server/setup-accounts.sh)**: Automates mailbox creation, accounts config, and DKIM generation.
- **[backup-mail.sh](file:///root/geminicli/projects/mail-server/backup-mail.sh)**: Automated backups helper script using Restic.
- **[docs/plans/2026-06-30-mailserver-modernization.md](file:///root/geminicli/projects/mail-server/docs/plans/2026-06-30-mailserver-modernization.md)**: Roadmap and planning document for the server modernization.

---

## 🔒 Hardening & Security Features

The mail server runs with maximum security configurations out-of-the-box:
1. **Modern TLS**: `TLS_LEVEL=modern` forces TLS 1.3 or high-grade TLS 1.2 secure ciphers.
2. **Brute-force Protection**: **Fail2Ban** is enabled (`ENABLE_FAIL2BAN=1`) to monitor log files and block malicious IPs dynamically.
3. **Spam Filtering**: **Rspamd** is enabled (`ENABLE_RSPAMD=1`) as a modern and fast replacement for SpamAssassin.
4. **SSL/TLS Certificates**: Mounted directly from Let's Encrypt (`/etc/letsencrypt`) on the host.
5. **Secure Ports Only**:
   - `25`: SMTP (Server-to-Server transfer)
   - `465`: SMTPS (Secure SMTP over SSL/TLS)
   - `587`: Submission (SMTP with authentication)
   - `993`: IMAPS (IMAP over SSL/TLS)
   - **Port 143 (unencrypted IMAP) is disabled** to prevent insecure connection attempts.

---

## 🚀 How to Deploy

1. Make sure your SSL/TLS certificates exist in `/etc/letsencrypt` on the host.
2. Prepare persistent data folders:
   ```bash
   mkdir -p docker-data/mail-data docker-data/mail-state docker-data/mail-logs docker-data/config
   ```
3. Boot up the services:
   ```bash
   docker compose up -d
   ```
4. Setup email accounts and DKIM keys:
   ```bash
   chmod +x setup-accounts.sh
   ./setup-accounts.sh
   ```

---

## 📈 Modernization Roadmap (Mid-2026)

| Target Feature | Description | Status |
| :--- | :--- | :--- |
| **Autoconfig & Autodiscover** | Automatic mail client configuration (Thunderbird/Outlook) | **Configured & Deployed** ✅ |
| **Encrypted Backups** | Off-site incremental backups of mailboxes using Restic | **Configured** (Script created) ✅ |
| **Prometheus Exporters** | Exposing postfix-exporter metrics on port 9154 | **Configured & Deployed** ✅ |
| **Rspamd Migration** | High-performance spam filter and DKIM signing integration | **Configured & Deployed** ✅ |

---

## 📜 License

This project is licensed under the **GNU GPLv3 License**. See [LICENSE](file:///root/geminicli/projects/mail-server/LICENSE) for details.
