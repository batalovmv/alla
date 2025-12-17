# Скрипт для инициализации git в папке проекта
$ErrorActionPreference = "Stop"

# Находим папку проекта
$desktop = [Environment]::GetFolderPath("Desktop")
$projectFolder = Get-ChildItem $desktop | Where-Object { $_.Name -like "*Сайт*" -or $_.Name -like "*мамы*" } | Select-Object -First 1

if (-not $projectFolder) {
    Write-Host "Папка проекта не найдена на рабочем столе"
    exit 1
}

$projectPath = $projectFolder.FullName
Write-Host "Найдена папка проекта: $projectPath"

# Переходим в папку проекта
Set-Location $projectPath

# Удаляем старый .git если есть
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
    Write-Host "Удален старый .git"
}

# Инициализируем git
git init
git remote add origin https://github.com/batalovmv/alla.git 2>$null
git branch -M main

Write-Host "Git инициализирован в: $(Get-Location)"
Write-Host "Теперь можно выполнить: git add . && git commit -m 'Initial commit' && git push -u origin main"
