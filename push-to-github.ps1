# Скрипт для отправки кода на GitHub
$ErrorActionPreference = "Continue"

Write-Host "Добавление файлов в git..."
git add .

Write-Host "Создание коммита..."
git commit -m "Initial commit: React + Redux cosmetology site"

Write-Host "Отправка в репозиторий..."
git push -u origin main

Write-Host "Готово! Код отправлен на GitHub."

