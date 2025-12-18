# Настройка GitHub Secrets для CI/CD

Для работы админ-панели с Firebase в GitHub Pages через CI/CD нужно настроить GitHub Secrets.

## Шаг 1: Перейдите в настройки репозитория

1. Откройте ваш репозиторий на GitHub
2. Нажмите на вкладку **Settings** (Настройки)
3. В левом меню найдите раздел **Secrets and variables** → **Actions**
4. Нажмите **New repository secret**

## Шаг 2: Добавьте следующие секреты

Добавьте каждый секрет отдельно, нажимая **New repository secret** для каждого:

### 1. VITE_FIREBASE_API_KEY
- **Name**: `VITE_FIREBASE_API_KEY`
- **Secret**: `AIzaSyD5uWHtk972D7S4rQTGgKT-Sv9Y-J-Bz9g`

### 2. VITE_FIREBASE_AUTH_DOMAIN
- **Name**: `VITE_FIREBASE_AUTH_DOMAIN`
- **Secret**: `alla-cosmetology.firebaseapp.com`

### 3. VITE_FIREBASE_PROJECT_ID
- **Name**: `VITE_FIREBASE_PROJECT_ID`
- **Secret**: `alla-cosmetology`

### 4. VITE_FIREBASE_STORAGE_BUCKET
- **Name**: `VITE_FIREBASE_STORAGE_BUCKET`
- **Secret**: `alla-cosmetology.firebasestorage.app`

### 5. VITE_FIREBASE_MESSAGING_SENDER_ID
- **Name**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Secret**: `422226108580`

### 6. VITE_FIREBASE_APP_ID
- **Name**: `VITE_FIREBASE_APP_ID`
- **Secret**: `1:422226108580:web:1dd99a5af4f381aa92c631`

## Шаг 3: Проверка

После добавления всех секретов:

1. Перейдите в раздел **Actions** вашего репозитория
2. Запустите workflow вручную через **Run workflow** или сделайте push в ветку `main`
3. Проверьте, что сборка прошла успешно

## Важно

- Секреты не видны в логах сборки
- Они доступны только во время выполнения workflow
- Не делитесь значениями секретов публично
- Если нужно изменить секрет, просто обновите его в настройках

## Альтернатива: Локальная разработка

Для локальной разработки создайте файл `.env.local` в корне проекта (см. `QUICK_START.md`).

