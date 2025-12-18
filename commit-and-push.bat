@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add .
git commit -m "feat: Add admin panel with Firebase integration

- Add Firebase configuration and services
- Implement authentication system
- Create admin panel with all CRUD operations
- Add procedures management
- Add reviews moderation
- Add contacts and about editing
- Add bookings management
- Update CI/CD workflow for Firebase secrets
- Add documentation for Firebase setup"
git push origin main
echo.
echo Готово! Изменения отправлены в репозиторий.
echo.
echo ВАЖНО: Не забудьте настроить GitHub Secrets!
echo См. инструкцию в GITHUB_SECRETS_SETUP.md
pause

