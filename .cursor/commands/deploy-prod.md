# deploy-prod

проверить git status
убедиться, что мы на main и подтянуть origin/main (git pull --rebase)
прогнать сборку (npm ci + npm run build)
закоммитить (chore(deploy): prod) и запушить в main → это триггерит существующий GitHub Pages workflow .github/workflows/deploy.yml