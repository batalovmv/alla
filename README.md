# Сайт косметолога (SPA + админ‑панель)

Сайт‑визитка косметолога: публичные страницы + админ‑панель для управления контентом.

- **Публичная часть**: `/`, `/procedures`, `/procedures/:id`, `/about`, `/reviews`, `/contacts`, `/privacy`
- **Админ‑панель**: `/admin/*` (требуется Firebase Auth)
- **Деплой**: GitHub Pages (base path **`/alla/`**)

## Технологии

- **React 18 + TypeScript (strict)**
- **React Router DOM v6** + ленивые страницы через `React.lazy`
- **Redux Toolkit** (slices: auth / procedures / booking / reviews)
- **react-hook-form**
- **Firebase** (Auth, Firestore, Storage) через `src/services/firebaseService.ts`
- **Vite 5** (manual chunks в `vite.config.ts`)
- **CSS Modules** + глобальные стили `src/assets/styles/index.css`

## Что уже сделано (ключевые фичи)

### Публичная часть

- **Каталог и карточки процедур** + страница детали процедуры
- **Отзывы**: публичное создание, отображение только одобренных (при наличии Firebase)
- **Контакты** + форма заявки (с валидацией, анти‑бот honeypot)
- **SEO**: мета‑теги, OG/Twitter, `robots.txt`, `sitemap.xml`
- **Fallback без Firebase**: публичная часть работает на mock‑данных (динамический import, не попадает в prod bundle) — `src/utils/api.ts`

### Админ‑панель

- **Логин** через Firebase Auth
- **CRUD**: процедуры, контакты, “О специалисте”
- **Модерация отзывов**
- **Заявки / клиенты / история услуг / отчёты**

### UX загрузок и производительность

- **Без “white screens” при lazy‑чанках**: per‑route `Suspense` fallback с **skeleton + top progress bar** (`src/components/common/PageFallback`, `TopProgress`, `Skeleton`)
- **Анти‑flicker** для микро‑загрузок: `useDelayedFlag`
- **Prefetch** lazy‑страниц:
  - по hover/focus в хедере (`src/components/layout/Header/Header.tsx`)
  - консервативно в idle после смены маршрута (`src/utils/idleCallback.ts`, `src/utils/prefetchPages.ts`)
- **Анимации появления**: `Reveal` (с уважением `prefers-reduced-motion`)
- **Главная “строится при скролле”**: прогрессивный маунт секций `LazyMount`

## Установка и запуск

```bash
npm install
npm run dev
```

Приложение: `http://localhost:5173`

### Сборка / предпросмотр

```bash
npm run build
npm run preview
```

## Переменные окружения

- Локально: `.env.local` (скопировать из `env.local.template`)
- В CI/CD: GitHub Secrets (см. `GITHUB_SECRETS_SETUP.md`)

В `env.local.template` перечислены все поддерживаемые переменные (Firebase, контакты, соцсети, `VITE_MAP_EMBED_URL`, и т.д.).

## GitHub Pages (важно)

- **base path**: `vite.config.ts` → `base: '/alla/'`
- **Router basename**: `src/main.tsx` → `<BrowserRouter basename={import.meta.env.BASE_URL}>`
- **Deep links на Pages**: `public/404.html` + скрипт в `index.html` (паттерн `rafgraph/spa-github-pages`)

## Деплой

- **Авто‑деплой**: `.github/workflows/deploy.yml` (запускается на `push` в `main`)
- **Скрипты**:
  - `npm run build`
  - `npm run deploy` (локальный ручной деплой через `gh-pages`, обычно не нужен при CI)

## Управление контентом

- **Рекомендуется**: через админку `/admin/login`
- **Fallback (без Firebase)**:
  - процедуры/отзывы: `src/utils/mockData.ts` (подключается динамически из `src/utils/api.ts`)
  - контакты: `src/config/constants.ts` (и/или env)

## Структура проекта (кратко)

```
src/
  pages/                 # публичные страницы + Admin/*
  components/            # UI, layout, admin, domain-компоненты
  store/                 # Redux store + slices
  services/              # firebaseService (единая точка работы с Firebase)
  utils/                 # api (firebase + mock), prefetch, in-view, validation, etc.
  config/                # routes, constants, firebase config
  assets/styles/         # глобальные стили
```

## Документация

- `QUICK_START.md` — быстрый старт
- `FIREBASE_SETUP.md` — настройка Firebase (Auth/Firestore/Storage)
- `FIRESTORE_RULES_SETUP.md` / `FIRESTORE_INDEXES_SETUP.md` — правила/индексы Firestore
- `GITHUB_SECRETS_SETUP.md` — секреты для CI
- `env.local.template` — список env‑переменных

## Roadmap (куда развивать дальше)

### UX/перф (приоритетно)

- **Тонкая настройка `LazyMount`**: пер‑секционный `rootMargin` (например, 200–600px в зависимости от блока), чтобы “строилось” и при этом не было задержек
- **Lighthouse/Perf budget**: добавить `Lighthouse CI`, бюджет по LCP/CLS/JS size
- **Bundle analysis**: подключить `rollup-plugin-visualizer` в отдельный скрипт (без влияния на prod)
- **Изображения**: WebP/AVIF, responsive `srcset`, preloading hero‑изображений, лимиты/сжатие при upload в админке

### Качество и стабильность

- **Error Boundary** на уровне страниц (чтобы не падало всё приложение)
- **E2E** (Playwright) для критических сценариев: навигация, форма записи, логин админки
- **Логи/мониторинг**: минимум — сбор ошибок (Sentry/LogRocket аналоги) + отключение PII

### Продуктовые фичи

- **Календарь записи** (слоты/расписание)
- **Галерея работ “до/после”**
- **Блог/статьи** (SEO‑контент)
- **PWA** (service worker) — только после оценки рисков кеширования/обновлений

## Лицензия

MIT
