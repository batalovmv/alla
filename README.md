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
- ✅ Отзывы клиентов
- ✅ Контакты с картой
- ✅ SEO оптимизация (мета-теги, Schema.org, sitemap)
- ✅ Адаптивный дизайн
- ✅ Автодеплой на GitHub Pages

## Установка

```bash
npm install
```

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

Добавьте отзывы в файл `src/utils/api.ts` в массив `mockReviews`.

## Структура проекта

```
src/
  components/          # Переиспользуемые компоненты
    common/           # UI компоненты (Button, Input, Card и т.д.)
    layout/           # Header, Footer, Layout
    procedures/       # Компоненты для процедур
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

## Будущие улучшения

- Интеграция с реальным API для отправки форм
- Интеграция с календарем для записи
- Интеграция с Яндекс.Картами или Google Maps
- Админ-панель для управления контентом
- Блог/статьи для SEO
- Галерея работ (до/после)

## Лицензия

MIT
