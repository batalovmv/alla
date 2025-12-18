# Сайт косметолога

Современный сайт-визитка для косметолога на React + Redux с формой записи на процедуры.

## Технологии

- React 18 + TypeScript
- Redux Toolkit для управления состоянием
- React Router v6 для навигации
- React Hook Form для работы с формами
- Vite для сборки
- CSS Modules для стилизации
- gh-pages для деплоя

## Функциональность

- ✅ Главная страница с Hero-секцией и популярными процедурами
- ✅ Каталог процедур с фильтрацией и поиском
- ✅ Детальные страницы процедур
- ✅ Форма записи на сеанс с валидацией
- ✅ Страница "О специалисте"
- ✅ Система реальных отзывов с формой добавления
- ✅ Хранение отзывов в localStorage
- ✅ Контакты с картой
- ✅ SEO оптимизация (мета-теги, Schema.org, sitemap)
- ✅ Адаптивный дизайн
- ✅ Автодеплой на GitHub Pages
- ✅ Оптимизация производительности (React.memo, code splitting, lazy loading)

## Установка

```bash
npm install
```

### Настройка Firebase (для админ-панели)

1. Создайте файл `.env.local` в корне проекта
2. Скопируйте содержимое из `env.local.template` в `.env.local`
3. Следуйте инструкциям в `QUICK_START.md` для настройки Firebase

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

### Процедуры

Добавьте процедуры в файл `src/utils/api.ts` в массив `mockProcedures`:

```typescript
export const mockProcedures: Procedure[] = [
  {
    id: '1',
    name: 'Название процедуры',
    category: 'Категория',
    // ...
  },
]
```

### Отзывы

Отзывы можно добавлять двумя способами:
1. Через форму на странице "Отзывы" (сохраняются в localStorage)
2. Добавить базовые отзывы в файл `src/utils/api.ts` в массив `mockReviews`

Все отзывы автоматически сохраняются в localStorage браузера и синхронизируются между вкладками.

## Структура проекта

```
src/
  components/          # Переиспользуемые компоненты
    common/           # UI компоненты (Button, Input, Card и т.д.)
    layout/           # Header, Footer, Layout
    procedures/       # Компоненты для процедур
    reviews/          # Компоненты для отзывов
  pages/              # Страницы приложения
    Home/             # Главная страница
    Procedures/       # Каталог процедур
    ProcedureDetail/  # Детальная страница процедуры
    About/            # О специалисте
    Reviews/          # Отзывы
    Contacts/         # Контакты и форма записи
  store/              # Redux store
    slices/           # Redux Toolkit slices
    hooks.ts          # Типизированные хуки
  utils/              # Утилиты
    api.ts            # Симуляция API
    validation.ts     # Валидация форм
    reviewsStorage.ts # Хранение отзывов в localStorage
  assets/             # Статические ресурсы
    styles/           # Глобальные стили
  config/             # Конфигурация
    routes.ts         # Маршруты
    constants.ts      # Константы
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

## Будущие улучшения

- Интеграция с календарем для записи
- Интеграция с Яндекс.Картами или Google Maps
- Блог/статьи для SEO
- Галерея работ (до/после)
- Service Worker для PWA

## Лицензия

MIT
