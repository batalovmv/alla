@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add .
git commit -m "Fix: Add CSS modules type declarations and remove unused import"
git push origin main
pause

