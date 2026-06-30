# 📧 Docker eMailServer Stack

[EN](README.md) | [UA](README.ua.md)

Цей репозиторій містить конфігурацію, скрипти та файли розгортання для запуску безпечного, захищеного поштового сервера на базі [docker-mailserver](https://github.com/docker-mailserver/docker-mailserver) на хості HTZNR.

---

## 📐 Огляд архітектури

Нижче наведено схему роботи поштового стеку та його взаємодії з клієнтами:

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef host fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef container fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;
    classDef config fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;

    subgraph Ext ["Зовнішні клієнти та сервери"]
        MUA["Поштові клієнти (Outlook, Thunderbird, iOS/Android)"]:::client
        Senders["Зовнішні SMTP-сервери (Gmail, Outlook, тощо)"]:::client
    end

    subgraph Host ["Хост-ОС HTZNR"]
        Firewall["NFTables фаєрвол (Port Forwarding)"]:::host
        Certs["SSL-сертифікати Let's Encrypt (/etc/letsencrypt)"]:::config
    end

    subgraph DMS ["Контейнер docker-mailserver"]
        Postfix["Postfix SMTP (Порти: 25, 465, 587)"]:::container
        Dovecot["Dovecot IMAPS (Порт: 993)"]:::container
        SpamAssassin["SpamAssassin (Фільтр спаму)"]:::container
        Fail2Ban["Fail2Ban (Захист від брутфорсу)"]:::container
        OpenDKIM["OpenDKIM (DKIM-підпис)"]:::container
    end

    MUA -->|Порти: 465, 587, 993| Firewall
    Senders -->|Порт: 25| Firewall

    Firewall -->|DNAT 25, 465, 587| Postfix
    Firewall -->|DNAT 993| Dovecot

    Postfix -->|Сканування| SpamAssassin
    Postfix -->|DKIM-підпис| OpenDKIM
    Dovecot -->|Аналіз логів| Fail2Ban
    Postfix -->|Аналіз логів| Fail2Ban

    Certs -->|Монтування read-only| Postfix
    Certs -->|Монтування read-only| Dovecot
```

---

## 🏗️ Структура проекту

- **[docker-compose.yml](file:///root/geminicli/projects/mail-server/docker-compose.yml)**: Опис Docker-сервісів, портів та монтування томів.
- **[mailserver.env](file:///root/geminicli/projects/mail-server/mailserver.env)**: Змінні середовища для налаштування безпеки (TLS, включені модулі).
- **[setup-accounts.sh](file:///root/geminicli/projects/mail-server/setup-accounts.sh)**: Скрипт автоматичного створення поштових скриньок та генерації DKIM-ключів.

---

## 🔒 Особливості безпеки та харденінгу

Поштовий сервер працює з максимальними налаштуваннями безпеки "з коробки":
1. **Modern TLS**: Параметр `TLS_LEVEL=modern` дозволяє використання лише протоколів TLS 1.3 або стійких шифрів TLS 1.2.
2. **Захист від брутфорсу**: Включено **Fail2Ban** (`ENABLE_FAIL2BAN=1`) для динамічного блокування IP-адрес зловмисників.
3. **Фільтрація спаму**: Працює **SpamAssassin** (`ENABLE_SPAMASSASSIN=1`) для перевірки вхідної пошти.
4. **SSL/TLS сертифікати**: Монтуються безпосередньо з लेट्स Let's Encrypt (`/etc/letsencrypt`) хост-системи.
5. **Тільки безпечні порти**:
   - `25`: SMTP (пересилання між серверами)
   - `465`: SMTPS (SMTP поверх SSL/TLS)
   - `587`: Submission (SMTP з авторизацією)
   - `993`: IMAPS (IMAP поверх SSL/TLS)
   - **Порт 143 (unencrypted IMAP) повністю вимкнено** з метою підвищення безпеки.

---

## 🚀 Як розгорнути

1. Переконайтеся, що на хості існують сертифікати у `/etc/letsencrypt`.
2. Створіть директорії для збереження даних:
   ```bash
   mkdir -p docker-data/mail-data docker-data/mail-state docker-data/mail-logs docker-data/config
   ```
3. Запустіть контейнер:
   ```bash
   docker compose up -d
   ```
4. Створіть акаунти та DKIM-ключі:
   ```bash
   chmod +x setup-accounts.sh
   ./setup-accounts.sh
   ```

---

## 📜 Ліцензія

Цей проект поширюється на умовах ліцензії **GNU GPLv3**. Детальніше див. у файлі [LICENSE](file:///root/geminicli/projects/mail-server/LICENSE).
