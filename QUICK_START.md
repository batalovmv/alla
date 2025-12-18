# Быстрый старт с Firebase

## Ваш проект уже настроен!

Конфигурация Firebase для проекта `alla-cosmetology` уже готова.

## Шаг 1: Создайте файл .env.local

**Вариант 1 (проще):** Скопируйте шаблон:
- В Windows: `copy env.local.template .env.local`
- В Linux/Mac: `cp env.local.template .env.local`

**Вариант 2:** Создайте файл `.env.local` вручную в корне проекта со следующим содержимым:

```
VITE_FIREBASE_API_KEY=AIzaSyD5uWHtk972D7S4rQTGgKT-Sv9Y-J-Bz9g
VITE_FIREBASE_AUTH_DOMAIN=alla-cosmetology.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=alla-cosmetology
VITE_FIREBASE_STORAGE_BUCKET=alla-cosmetology.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=422226108580
VITE_FIREBASE_APP_ID=1:422226108580:web:1dd99a5af4f381aa92c631
```

## Шаг 2: Установите зависимости

```bash
npm install
```

## Шаг 3: Настройте Firebase в консоли

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `alla-cosmetology`
3. Включите **Authentication** (Email/Password)
4. Создайте **Firestore Database** (режим тестирования)
5. Включите **Storage**
6. Создайте пользователя в Authentication для входа в админку

Подробные инструкции по настройке правил безопасности смотрите в `FIREBASE_SETUP.md`

## Шаг 4: Запустите проект

```bash
npm run dev
```

## Шаг 5: Войдите в админку

1. Откройте браузер: `http://localhost:5173/admin/login`
2. Введите email и пароль, созданные в Firebase Authentication
3. Начните управлять контентом!

## Что дальше?

- Добавьте процедуры через админку
- Модерируйте отзывы
- Обновите контактную информацию
- Заполните информацию "О специалисте"

## Важно

- Файл `.env.local` не должен попадать в git (уже в .gitignore)
- Не делитесь своими учетными данными Firebase
- Для продакшена настройте более строгие правила безопасности

