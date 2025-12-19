@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add src/components/common/Select/Select.tsx src/pages/Contacts/Contacts.tsx
git commit -m "fix: исправление автоматического выбора процедуры через Controller"
git push origin main

