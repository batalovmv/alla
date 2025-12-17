@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Добавление файлов...
git add .
echo.
echo Создание коммита...
git commit -m "feat: Performance optimizations and real reviews system

- Add React.memo for components optimization
- Optimize useMemo/useCallback hooks
- Add lazy loading for images
- Implement code splitting with React.lazy
- Optimize Vite build configuration
- Add real reviews system with localStorage
- Add review form with validation
- Add review moderation system"
echo.
echo Отправка в репозиторий...
git push origin main
echo.
echo Готово! Все оптимизации залиты на GitHub.
pause

