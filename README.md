# Сайт косметолога

Современный сайт-визитка для косметолога на React + Redux с формой записи на процедуры.

## Технологии

- React 18 + TypeScript
- Redux Toolkit для управления состоянием
- React Router v6 для навигации
- React Hook Form для работы с формами
- Firebase (Authentication, Firestore, Storage) для админ-панели
- Vite для сборки
- CSS Modules для стилизации
- GitHub Actions для CI/CD
- gh-pages для деплоя

## Функциональность

### Публичная часть сайта

- ✅ Главная страница с Hero-секцией и популярными процедурами
- ✅ Каталог процедур с фильтрацией и поиском
- ✅ Детальные страницы процедур
- ✅ Форма записи на сеанс с валидацией
- ✅ Страница "О специалисте"
- ✅ Система реальных отзывов с формой добавления
- ✅ Хранение отзывов в Firebase и localStorage (fallback)
- ✅ Контакты с формой записи
- ✅ SEO оптимизация (мета-теги, Schema.org, sitemap)
- ✅ Адаптивный дизайн
- ✅ Автодеплой на GitHub Pages через CI/CD
- ✅ Оптимизация производительности (React.memo, code splitting, lazy loading)

### Админ-панель

- ✅ Авторизация через Firebase Authentication
- ✅ Управление процедурами (CRUD операции)
- ✅ Загрузка изображений процедур в Firebase Storage
- ✅ Модерация отзывов (одобрение, отклонение, удаление)
- ✅ Редактирование контактной информации
- ✅ Редактирование информации "О специалисте" с загрузкой фото
- ✅ Просмотр и управление заявками на запись
- ✅ Дашборд со статистикой

## Установка

```bash
npm install
```

### Настройка Firebase (для админ-панели)

**Для локальной разработки:**
1. Создайте файл `.env.local` в корне проекта
2. Скопируйте содержимое из `env.local.template` в `.env.local`
3. Следуйте инструкциям в `QUICK_START.md` для настройки Firebase

**Для CI/CD (GitHub Pages):**
1. Настройте GitHub Secrets (см. `GITHUB_SECRETS_SETUP.md`)
2. Настройте Firebase в консоли (см. `FIREBASE_SETUP.md`)
3. После push изменения автоматически задеплоятся

## Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

## Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `dist/`

## Деплой на GitHub Pages

### Ручной деплой

```bash
npm run deploy
```

### Автоматический деплой

При каждом push в ветку `main` автоматически запускается GitHub Actions workflow, который собирает и деплоит сайт на GitHub Pages.

## Настройка контента

### Контактная информация

Отредактируйте файл `src/config/constants.ts`:

```typescript
export const CONTACT_INFO = {
  phone: '+7 (XXX) XXX-XX-XX',
  email: 'info@example.com',
  address: 'г. [Название города], ул. [Название улицы], д. [Номер]',
  // ...
}
```

### Управление контентом

**Через админ-панель (рекомендуется):**
1. Войдите в админку по адресу `/admin/login`
2. Используйте интерфейс для управления:
   - Добавление и редактирование процедур
   - Модерация отзывов
   - Обновление контактной информации
   - Редактирование информации "О специалисте"

**Через код (fallback, если Firebase не настроен):**
- Процедуры: `src/utils/api.ts` → `mockProcedures`
- Отзывы: `src/utils/api.ts` → `mockReviews`
- Контакты: `src/config/constants.ts` → `CONTACT_INFO`

При наличии Firebase все данные хранятся в Firestore и автоматически синхронизируются.

## Структура проекта

```
src/
  components/          # Переиспользуемые компоненты
    common/           # UI компоненты (Button, Input, Card и т.д.)
    layout/           # Header, Footer, Layout
    procedures/       # Компоненты для процедур
    reviews/          # Компоненты для отзывов
    admin/            # Компоненты админ-панели
      AdminLayout/    # Layout админки
      AdminSidebar/   # Боковое меню
      ImageUpload/    # Загрузка изображений
    auth/             # Компоненты авторизации
      LoginForm/      # Форма входа
  pages/              # Страницы приложения
    Home/             # Главная страница
    Procedures/       # Каталог процедур
    ProcedureDetail/  # Детальная страница процедуры
    About/            # О специалисте
    Reviews/          # Отзывы
    Contacts/         # Контакты и форма записи
    Admin/            # Страницы админ-панели
      Login/          # Страница входа
      Dashboard/      # Дашборд
      Procedures/     # Управление процедурами
      Reviews/        # Модерация отзывов
      Contacts/       # Редактирование контактов
      About/          # Редактирование "О специалисте"
      Bookings/       # Просмотр заявок
  store/              # Redux store
    slices/           # Redux Toolkit slices
      authSlice.ts    # Авторизация
      proceduresSlice.ts
      bookingSlice.ts
      reviewsSlice.ts
    hooks.ts          # Типизированные хуки
  services/           # Сервисы
    firebaseService.ts # Работа с Firebase
  utils/              # Утилиты
    api.ts            # API (Firebase + fallback на mock)
    validation.ts     # Валидация форм
    reviewsStorage.ts # Хранение отзывов в localStorage
  assets/             # Статические ресурсы
    styles/           # Глобальные стили
  config/             # Конфигурация
    routes.ts         # Маршруты
    constants.ts      # Константы
    firebase.ts       # Конфигурация Firebase
  types/              # TypeScript типы
```

## SEO

Сайт оптимизирован для поисковых систем:

- Мета-теги для каждой страницы
- Open Graph теги для социальных сетей
- Schema.org разметка (LocalBusiness)
- Sitemap.xml
- Robots.txt
- Semantic HTML

## Адаптивность

Сайт полностью адаптирован для всех устройств:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Оптимизации производительности

- React.memo для компонентов
- useMemo/useCallback для дорогих вычислений
- Lazy loading изображений
- Code splitting с React.lazy
- Оптимизация Vite bundle (manual chunks)
- Resource hints (preconnect, dns-prefetch)

## Админ-панель

Сайт включает админ-панель для управления контентом. Для работы админки требуется настройка Firebase.

### Настройка для CI/CD (GitHub Pages)

Если вы используете автоматический деплой через GitHub Actions:

1. Настройте GitHub Secrets (см. `GITHUB_SECRETS_SETUP.md`)
2. Настройте Firebase в консоли (см. `FIREBASE_SETUP.md`)
3. После следующего push админка будет работать на GitHub Pages

### Настройка для локальной разработки

1. Создайте файл `.env.local` (см. `QUICK_START.md`)
2. Настройте Firebase в консоли (см. `FIREBASE_SETUP.md`)
3. Запустите `npm run dev`

### Доступ к админке

- URL: `/admin/login` (на GitHub Pages: `https://batalovmv.github.io/alla/admin/login`)
- Войдите с email и паролем, созданными в Firebase Authentication

### Функции админки

- Управление процедурами (добавление, редактирование, удаление)
- Модерация отзывов (одобрение, отклонение, удаление)
- Редактирование контактной информации
- Редактирование информации "О специалисте"
- Просмотр и управление заявками на запись

## Документация

- `QUICK_START.md` - Быстрый старт с Firebase
- `FIREBASE_SETUP.md` - Подробная инструкция по настройке Firebase
- `GITHUB_SECRETS_SETUP.md` - Настройка GitHub Secrets для CI/CD
- `env.local.template` - Шаблон конфигурации Firebase

## Будущие улучшения

- Интеграция с календарем для записи
- Интеграция с Яндекс.Картами или Google Maps
- Блог/статьи для SEO
- Галерея работ (до/после)
- Service Worker для PWA
- Расширенная аналитика в админ-панели

## Лицензия

MIT
