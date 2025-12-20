# Сайт косметолога (SPA + админ-панель)

Сайт-визитка для косметолога: публичная часть + админ-панель для управления процедурами, отзывами и заявками. Приложение собирается через Vite и деплоится на GitHub Pages под базовым путем `/alla/` (см. `vite.config.ts`).

## Технологии

- React 18 + TypeScript (strict)
- React Router DOM v6 + `React.lazy` для ленивой загрузки страниц
- Redux Toolkit + `react-redux`
- React Hook Form для форм
- Firebase (Auth, Firestore, Storage) через `src/services/firebaseService.ts`
- Vite 5 с ручным разбиением на чанки (`vite.config.ts`)
- CSS Modules + глобальные стили в `src/assets/styles/index.css`
- GitHub Actions → GitHub Pages (`.github/workflows/deploy.yml`)

## Что уже сделано

### Публичная часть

- Главная (`/`) с Hero, списком процедур и отзывами (+ `LazyMount`/Reveal для плавного появления)
- Каталог процедур `/procedures` (фильтры, бесконечный скролл, Skeleton, Reveal, карусель)
- Детальная страница процедуры (`/procedures/:id`) с CTA и похожими процедурами
- Страница “О специалисте”, отзывы и контакты (с формой записи и картой `VITE_MAP_EMBED_URL`)
- SEO: индивидуальные мета-теги, OG/Twitter, Schema.org, `robots.txt`, `sitemap.xml`
- Без Firebase сайт работает на mock-данных (`src/utils/api.ts`, `mockData.ts`)
- Загрузка новых страниц без “white screens”: `Suspense` → `PageFallback` (Skeleton + TopProgress)
- Prefetch lazy-чанков и кеширование (hover/focus на навигации, `requestIdleCallback`)
- Аналитика UX: skeletons, `Reveal`, `useDelayedFlag`, `LazyMount` (#home “строится при скролле”)

### Админ-панель

- Вход через Firebase Auth (`/admin/login`)
- CRUD: процедуры, отзывы, контакты, “О специалисте”, заявки, клиенты
- Модерация отзывов, отчёты, загрузка изображений (Firebase Storage)
- Обработка заявок/клиентов/истории услуг с защитой PII

## Getting Started

### Подготовка окружения

1. Создайте `.env.local` в корне, скопируйте содержимое `env.local.template`
2. Заполните `VITE_FIREBASE_*`, `VITE_ADMIN_UID(S)` и публичные переменные (контакты, соцсети, `VITE_MAP_EMBED_URL`). Эти `VITE_*` значения попадут в собранный бандл, поэтому держите в них только то, что не секретно.
3. Файл `.env.local` не должен коммититься (`.gitignore` уже настроен).

### Установка и запуск

```bash
npm install
npm run dev
```

Открыть `http://localhost:5173`. Для предпросмотра `npm run preview` после `npm run build`.

### Сборка

```bash
npm run build
```

## Firebase: Auth / Firestore / Storage

1. Создайте/выберите **свой** проект Firebase (не коммитьте и не публикуйте приватные данные проекта).
2. Включите Email/Password в Authentication.
3. Создайте пользователя администратора и добавьте его UID в allowlist через `VITE_ADMIN_UID` или `VITE_ADMIN_UIDS`.
4. Включите Firestore Database и Storage.
5. Примените правила безопасности:
   - Firestore: `firebase.rules/firestore.rules`
   - Storage: `firebase.rules/storage.rules`

> Важно: этот репозиторий публичный. Не добавляйте в README/код реальные UID админов, реальные контакты клиентов, токены или любые приватные данные.

### Firestore indexes

Если Firebase просит индекс (`The query requires an index`) — используйте ссылку из ошибки или создайте нужный composite index в Firebase Console (Firestore → Indexes).

## GitHub Secrets (CI/CD)

Workflow `.github/workflows/deploy.yml` передаёт переменные окружения в сборку.

- Список поддерживаемых переменных: `env.local.template`
- В GitHub: `Settings → Secrets and variables → Actions` → добавьте необходимые `VITE_*`

> Помните: любые `VITE_*` **видны в браузере** (это часть фронтенда). Не храните в них приватные ключи/токены. Реальная защита — Firestore/Storage rules + allowlist админов.

## GitHub Pages (важно)

- `vite.config.ts` → `base: '/alla/'`
- `src/main.tsx` → `<BrowserRouter basename={import.meta.env.BASE_URL}>`
- `public/404.html` + `index.html` используют `rafgraph/spa-github-pages` для Deep Link.

## Деплой

- `npm run build`
- `npm run deploy` (для ручного деплоя через `gh-pages`, обычно CI делает `npm run build` и пушит `dist`)
- GitHub Actions workflow `.github/workflows/deploy.yml` запускается на `push` в `main` и публикует `dist` через `peaceiris/actions-gh-pages`.

## Управление контентом

- Через админку `/admin/login` (требует Firebase Auth + allowlist UID)
- Без Firebase (fallback): процедуры/отзывы из `src/utils/mockData.ts` (динамический import), контакты — `src/config/constants.ts` или env.
- `src/utils/api.ts` переключает между Firebase и mock автоматически.

## Структура проекта (кратко)

```
src/
  pages/                 # публичные страницы + Admin/*
  components/            # common, layout, admin, domain-компоненты
  store/                 # Redux store + slices
  services/              # firebaseService
  utils/                 # api (firebase + mock), hooks, prefetch utilities
  config/                # routes, constants, firebase config
  assets/styles/         # глобальные стили
```

## Roadmap

### UX и производительность

- Тонкая настройка `LazyMount`/Reveal, чтобы блоки монтировались с нужным `rootMargin`
- `Lighthouse CI` и Performance Budget (LCP/CLS/JS size)
- Bundle analysis (`rollup-plugin-visualizer`) + сжатие изображений (WebP/AVIF, responsive `srcset`, preloading hero)

### Качество и стабильность

- Error Boundary на уровне страниц
- E2E (Playwright) покрытие критичных путей: навигация, форма записи, логин админки
- Логи/мониторинг (Sentry/LogRocket), без PII

### Продуктовые фичи

- Календарь записи (слоты/расписание)
- Галерея работ “до/после”
- Блог/статьи для SEO
- PWA (service worker) после оценки кеширования

## Лицензия

MIT
