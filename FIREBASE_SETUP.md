# Инструкция по настройке Firebase для админ-панели

## Шаг 1: Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Добавить проект" или "Create a project"
3. Введите название проекта (например, "alla-cosmetology")
4. Следуйте инструкциям для создания проекта

## Шаг 2: Настройка Authentication

1. В боковом меню выберите "Authentication"
2. Нажмите "Начать" или "Get started"
3. Перейдите на вкладку "Sign-in method"
4. Включите "Email/Password"
5. Нажмите "Сохранить"

## Шаг 3: Создание учетной записи администратора

1. В разделе Authentication перейдите на вкладку "Users"
2. Нажмите "Add user"
3. Введите email и пароль для администратора
4. Запомните эти данные - они понадобятся для входа в админку

## Шаг 4: Настройка Firestore Database

1. В боковом меню выберите "Firestore Database"
2. Нажмите "Создать базу данных" или "Create database"
3. Выберите режим: "Начните в тестовом режиме" (для начала)
4. Выберите регион (ближайший к вам)
5. Нажмите "Готово"

### Настройка правил безопасности Firestore

1. Перейдите в раздел "Правила" (Rules)
2. Замените правила на следующие:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Процедуры - читать могут все, писать только авторизованные
    match /procedures/{procedureId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Отзывы - читать одобренные могут все, писать все, модерация только авторизованные
    match /reviews/{reviewId} {
      allow read: if resource.data.approved == true || request.auth != null;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
    
    // Контактная информация - читать все, писать только авторизованные
    match /contactInfo/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Информация о специалисте - читать все, писать только авторизованные
    match /aboutInfo/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Заявки - читать и писать только авторизованные, создавать все
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
      allow create: if true;
    }
  }
}
```

3. Нажмите "Опубликовать"

## Шаг 5: Настройка Storage

1. В боковом меню выберите "Storage"
2. Нажмите "Начать" или "Get started"
3. Примите правила по умолчанию
4. Выберите регион (тот же, что и для Firestore)

### Настройка правил Storage

1. Перейдите в раздел "Правила" (Rules)
2. Замените правила на следующие:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Изображения процедур - читать все, писать только авторизованные
    match /procedures/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Фото специалиста - читать все, писать только авторизованные
    match /about/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Нажмите "Опубликовать"

## Шаг 6: Получение конфигурации

1. В боковом меню выберите "Project settings" (⚙️)
2. Прокрутите вниз до раздела "Your apps"
3. Нажмите на иконку веб-приложения (</>)
4. Зарегистрируйте приложение (если еще не зарегистрировано)
5. Скопируйте значения из объекта `firebaseConfig`

## Шаг 7: Настройка переменных окружения

1. Создайте файл `.env.local` в корне проекта (рядом с `package.json`)

2. Скопируйте содержимое из файла `.env.local.example` или создайте файл со следующим содержимым:

```
VITE_FIREBASE_API_KEY=AIzaSyD5uWHtk972D7S4rQTGgKT-Sv9Y-J-Bz9g
VITE_FIREBASE_AUTH_DOMAIN=alla-cosmetology.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=alla-cosmetology
VITE_FIREBASE_STORAGE_BUCKET=alla-cosmetology.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=422226108580
VITE_FIREBASE_APP_ID=1:422226108580:web:1dd99a5af4f381aa92c631
```

**Важно**: Файл `.env.local` уже добавлен в `.gitignore` и не будет закоммичен в репозиторий.

## Шаг 8: Установка зависимостей

```bash
npm install
```

## Шаг 9: Запуск проекта

```bash
npm run dev
```

## Шаг 10: Вход в админку

1. Откройте браузер и перейдите на `/admin/login`
2. Введите email и пароль, созданные в шаге 3
3. После входа вы попадете в админ-панель

## Важные замечания

- **Безопасность**: В продакшене рекомендуется настроить более строгие правила Firestore и Storage
- **Резервное копирование**: Регулярно делайте резервные копии данных Firestore
- **Лимиты**: Бесплатный тариф Firebase имеет ограничения, ознакомьтесь с ними на сайте Firebase

## Решение проблем

### Ошибка "Firebase: Error (auth/invalid-api-key)"
- Проверьте, что все переменные окружения в `.env.local` заполнены правильно
- Убедитесь, что файл называется именно `.env.local` (не `.env`)

### Ошибка "Permission denied" при записи
- Проверьте правила Firestore и Storage
- Убедитесь, что вы авторизованы в админке

### Изображения не загружаются
- Проверьте правила Storage
- Убедитесь, что Storage включен в Firebase Console

