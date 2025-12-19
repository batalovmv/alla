# Настройка правил безопасности Firestore

## Проблема

Если вы получаете ошибку `Missing or insufficient permissions` при отправке заявки, это означает, что правила безопасности Firestore не настроены правильно.

## Решение

### Шаг 1: Откройте консоль Firebase

1. Перейдите на https://console.firebase.google.com/
2. Выберите ваш проект `alla-cosmetology`
3. В левом меню выберите **Firestore Database**
4. Перейдите на вкладку **Rules** (Правила)

### Шаг 2: Установите следующие правила

Скопируйте и вставьте следующие правила в редактор правил:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Функция для проверки администратора (allowlist по UID)
    // 1) Firebase Console -> Authentication -> Users -> UID
    // 2) Впишите UID ниже (можно несколько UID)
    function isAdmin() {
      return request.auth != null
        && request.auth.uid in [
          "ADMIN_UID_1"
        ];
    }
    
    // Процедуры - публичное чтение, только админы могут писать
    match /procedures/{procedureId} {
      allow read: if true; // Все могут читать
      allow write: if isAdmin(); // Только админы могут создавать/обновлять/удалять
    }
    
    // Отзывы - публичное чтение только одобренных, публичное создание, только админы могут модерацию
    match /reviews/{reviewId} {
      allow read: if resource.data.approved == true || isAdmin(); // Публично читаем только одобренные
      // Все могут создавать отзывы, НО без возможности самосогласования
      allow create: if
        request.resource.data.keys().hasOnly([
          'clientName',
          'procedureId',
          'procedureName',
          'rating',
          'text',
          'date',
          'createdAt',
          'approved'
        ])
        && request.resource.data.approved == false;
      allow update, delete: if isAdmin(); // Только админы могут обновлять/удалять
    }
    
    // Заявки - публичное создание, только админы могут читать/обновлять/удалять
    match /bookings/{bookingId} {
      // Важно: публичное создание только с валидными полями.
      // Статус разрешаем ТОЛЬКО 'new'. createdAt — timestamp, близкий к request.time.
      allow create: if
        request.resource.data.keys().hasOnly([
          'name',
          'phone',
          'email',
          'procedureId',
          'desiredDate',
          'desiredTime',
          'comment',
          'consent',
          'procedureName',
          'status',
          'createdAt'
        ])
        && request.resource.data.name is string
        && request.resource.data.phone is string
        && request.resource.data.procedureId is string
        && request.resource.data.desiredDate is string
        && request.resource.data.desiredTime is string
        && request.resource.data.consent is bool
        && request.resource.data.consent == true
        && request.resource.data.status == 'new'
        && request.resource.data.createdAt is timestamp
        && request.resource.data.createdAt <= request.time
        && request.resource.data.createdAt >= request.time - duration.value(10, 'm');
      allow read, update, delete: if isAdmin(); // Только админы могут читать/обновлять/удалять
    }
    
    // Клиенты - ТОЛЬКО админы.
    // Клиентская база - чувствительные данные (PII). Публичной части сайта доступ запрещен.
    match /clients/{clientId} {
      allow read, write: if isAdmin();
    }
    
    // Записи об оказанных услугах - только админы
    match /serviceRecords/{recordId} {
      allow read, write: if isAdmin(); // Только админы
    }
    
    // Контактная информация - публичное чтение, только админы могут обновлять
    match /contactInfo/{document} {
      allow read: if true; // Все могут читать
      allow write: if isAdmin(); // Только админы могут обновлять
    }
    
    // Информация "О специалисте" - публичное чтение, только админы могут обновлять
    match /aboutInfo/{document} {
      allow read: if true; // Все могут читать
      allow write: if isAdmin(); // Только админы могут обновлять
    }
  }
}
```

### Шаг 3: Опубликуйте правила

1. Нажмите кнопку **Publish** (Опубликовать)
2. Дождитесь подтверждения, что правила опубликованы

### Шаг 4: Проверьте работу

После публикации правил попробуйте снова отправить заявку. Ошибка должна исчезнуть.

## Важные замечания

### Безопасность

⚠️ **Внимание**: Эти правила позволяют любому пользователю создавать заявки. Это нормально для публичного сайта, но убедитесь, что:

1. **Админ-панель защищена** - только авторизованные пользователи могут входить в админку
2. **Чувствительные данные защищены** - записи об услугах (`serviceRecords`) доступны только админам
3. **Заявки защищены** - только админы могут видеть и управлять заявками
4. **Клиенты защищены** - коллекция `clients` доступна только админам (PII)

### Альтернативный вариант (более строгий)

Если вы хотите более строгие правила, можно добавить проверку на наличие определенных полей:

```javascript
// Для заявок - проверка обязательных полей
match /bookings/{bookingId} {
  allow create: if request.resource.data.keys().hasAll(['name', 'phone', 'procedureId', 'desiredDate', 'desiredTime'])
                 && request.resource.data.name is string
                 && request.resource.data.phone is string;
  allow read, update, delete: if isAdmin();
}
```

Но для начала используйте более простые правила выше.

## Проверка правил

После настройки правил вы можете проверить их работу:

1. **Публичный доступ**: Откройте сайт в режиме инкогнито (без авторизации) и попробуйте:
   - Просмотреть процедуры ✅
   - Просмотреть отзывы ✅
   - Отправить заявку ✅
   - Просмотреть заявки ❌ (должна быть ошибка)

2. **Админский доступ**: Войдите в админ-панель и проверьте:
   - Просмотр заявок ✅
   - Просмотр клиентов ✅
   - Создание/редактирование процедур ✅
   - Модерация отзывов ✅

## Дополнительная информация

Если у вас все еще возникают проблемы:

1. Проверьте, что вы используете правильный проект Firebase
2. Убедитесь, что Firebase Authentication включен
3. Проверьте, что вы авторизованы в админ-панели (для админских операций)
4. Посмотрите логи в консоли браузера для более детальной информации об ошибке

