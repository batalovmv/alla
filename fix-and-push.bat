@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add .
git commit -m "fix: Resolve TypeScript compilation errors

- Remove unused imports (ROUTES, useEffect, Select, navigate)
- Fix AdminLayout routing structure to use Outlet properly
- Remove unused variable in Dashboard
- Fix Suspense wrapping for lazy-loaded admin components"
git push origin main
echo.
echo Готово! Исправления отправлены в репозиторий.
pause

