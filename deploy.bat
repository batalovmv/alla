@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Текущая директория: %CD%
echo.
echo Инициализация git...
git init
git remote add origin https://github.com/batalovmv/alla.git 2>nul
git branch -M main
echo.
echo Добавление файлов...
git add .
echo.
echo Создание коммита...
git commit -m "Initial commit: React + Redux косметология сайт"
echo.
echo Отправка в репозиторий...
git push -u origin main
echo.
echo Готово!
pause

