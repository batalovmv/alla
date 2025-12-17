@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add .github/workflows/deploy.yml
git commit -m "Fix: Use gh-pages action instead of GitHub Pages workflow"
git push origin main
echo.
echo Готово! Workflow обновлен.
pause

