# Инструкция по деплою

## Быстрый деплой

Выполните следующие команды в терминале (Git Bash или PowerShell) в папке проекта:

```bash
git add .
git commit -m "Fix: Update GitHub Actions workflow to work without lock file"
git push origin main
```

## Что было исправлено

- Убран `cache: 'npm'` из setup-node (требует lock файл)
- Заменен `npm ci` на `npm install` (работает без lock файла)

После push GitHub Actions автоматически соберет и задеплоит сайт.

## Настройка GitHub Pages

После первого успешного деплоя:
1. Перейдите в Settings → Pages репозитория
2. В разделе "Source" выберите "GitHub Actions"
3. Сайт будет доступен по адресу: https://batalovmv.github.io/alla/

