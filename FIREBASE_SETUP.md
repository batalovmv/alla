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
5. Откройте созданного пользователя и скопируйте поле **UID** (оно понадобится для правил безопасности)

## Шаг 4: Настройка Firestore Database

1. В боковом меню выберите "Firestore Database"
2. Нажмите "Создать базу данных" или "Create database"
3. Выберите режим: "Начните в тестовом режиме" (для начала)
4. Выберите регион (ближайший к вам)
5. Нажмите "Готово"

### Настройка правил безопасности Firestore (безопасный вариант для 1 администратора)

1. Перейдите в раздел "Правила" (Rules)
2. Замените правила на следующие (впишите ваш UID вместо `ADMIN_UID_1`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.uid in [
          "ADMIN_UID_1"
        ];
    }

    // Процедуры - читать могут все, писать только админ
    match /procedures/{procedureId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Отзывы - читать одобренные могут все, создавать все, модерация только админ
    match /reviews/{reviewId} {
      allow read: if resource.data.approved == true || isAdmin();
      allow create: if request.resource.data.approved == false;
      allow update, delete: if isAdmin();
    }
    
    // Контактная информация - читать все, писать только авторизованные
    match /contactInfo/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Информация о специалисте - читать все, писать только авторизованные
    match /aboutInfo/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Заявки - публичное создание, только админы могут читать/обновлять/удалять
    match /bookings/{bookingId} {
      allow create: if true; // Все могут создавать заявки
      allow read, update, delete: if isAdmin(); // Только админы могут читать/обновлять/удалять
    }
    
    // Клиенты - ТОЛЬКО админ (PII)
    match /clients/{clientId} {
      allow read, write: if isAdmin();
    }
    
    // Записи об оказанных услугах - только админы
    match /serviceRecords/{recordId} {
      allow read, write: if isAdmin(); // Только админы
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

### Настройка правил Storage (безопасный вариант для 1 администратора)

1. Перейдите в раздел "Правила" (Rules)
2. Замените правила на следующие (впишите ваш UID вместо `ADMIN_UID_1`):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null
        && request.auth.uid in [
          "ADMIN_UID_1"
        ];
    }

    // Изображения процедур - читать все, писать только авторизованные
    match /procedures/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Фото специалиста - читать все, писать только авторизованные
    match /about/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
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

2. Скопируйте содержимое из файла `env.local.template` (в репозитории) и заполните значениями из Firebase Console:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_ADMIN_UID=ADMIN_UID_1
# или список:
# VITE_ADMIN_UIDS=ADMIN_UID_1,ADMIN_UID_2
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

### Ошибка "Permission denied" или "Missing or insufficient permissions"
- **ВАЖНО**: Проверьте правила Firestore - они должны разрешать создание заявок и клиентов для всех пользователей
- Убедитесь, что правила опубликованы (нажмите "Publish" после изменения)
- Для детальной инструкции см. файл `FIRESTORE_RULES_SETUP.md`
- Убедитесь, что вы авторизованы в админке (для админских операций)

### Изображения не загружаются
- Проверьте правила Storage
- Убедитесь, что Storage включен в Firebase Console

