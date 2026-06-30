# 📧 Docker Mailserver Stack (Weby Homelab)

Цей репозиторій містить конфігурацію та скрипти для розгортання та адміністрування безпечного поштового сервера на базі [docker-mailserver](https://github.com/docker-mailserver/docker-mailserver) у екосистемі **Weby Homelab** на сервері HTZNR.

---

## 🏗️ Структура проєкту

- **[docker-compose.yml](file:///root/geminicli/projects/mail-server/docker-compose.yml)**: Опис сервісу поштового сервера, прокинутих портів та монтування томів.
- **[mailserver.env](file:///root/geminicli/projects/mail-server/mailserver.env)**: Налаштування змінних середовища для тюнінгу безпеки (TLS, SpamAssassin, Fail2Ban, тощо).
- **[setup-accounts.sh](file:///root/geminicli/projects/mail-server/setup-accounts.sh)**: Скрипт автоматичної ініціалізації поштових скриньок та генерації DKIM-ключів.

---

## 🔒 Налаштування безпеки & Харденінг

Поштовий сервер налаштований за принципом максимальної безпеки:
1. **Modern TLS**: Параметр `TLS_LEVEL=modern` забезпечує використання лише сучасних та стійких шифрів.
2. **Антиспам та Антивірус**:
   - Активовано **SpamAssassin** (`ENABLE_SPAMASSASSIN=1`) для фільтрації спаму.
   - Інтегровано **Fail2Ban** (`ENABLE_FAIL2BAN=1`) для блокування хостів, що намагаються підібрати паролі.
3. **SSL/TLS сертифікати**: Монтуються напряму з Let's Encrypt хоста (сертифікат для `srvrs.top`).
4. **Порти безпеки**:
   - `25` (SMTP для пересилання між серверами)
   - `465` (SMTPS - SMTP поверх SSL/TLS)
   - `587` (Submission - SMTP з автентифікацією)
   - `993` (IMAPS - IMAP поверх SSL/TLS)
   - Порт `143` (IMAP) відкритий для внутрішньої сумісності, але трафік має бути зашифрований (STARTTLS).

---

## 🚀 Як розгорнути

1. Переконайтеся, що на хості налаштовані Let's Encrypt сертифікати для вашого домену у `/etc/letsencrypt`.
2. Створіть необхідні директорії для зберігання даних:
   ```bash
   mkdir -p docker-data/mail-data docker-data/mail-state docker-data/mail-logs docker-data/config
   ```
3. Запустіть контейнер:
   ```bash
   docker compose up -d
   ```
4. Ініціалізуйте акаунти та згенеруйте DKIM:
   ```bash
   chmod +x setup-accounts.sh
   ./setup-accounts.sh
   ```

---

## 📜 Ліцензія

Цей проєкт поширюється на умовах ліцензії **GNU GPLv3**. Детальніше див. у файлі [LICENSE](file:///root/geminicli/projects/mail-server/LICENSE).
