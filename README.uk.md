# NoteHub

> Застосунок для нотаток на Next.js App Router: фільтрація за тегами, пошук, перегляд нотатки в модалці без втрати списку та створення нотаток із чернеткою, що зберігається автоматично.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-FF4154?logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-v5-443E38)

**🔗 Живий сайт:** [notehub-lite.vercel.app](https://notehub-lite.vercel.app/notes/filter/all) · 🇬🇧 [English version](./README.md)

![Список нотаток із сайдбаром тегів](./docs/screenshots/notes-list.png)

## Про проєкт

NoteHub — невеликий CRUD-застосунок для особистих нотаток на публічному навчальному API, зроблений під час курсу Next.js у GoIT. Мета проєкту — відпрацювати можливості роутингу, якими App Router відрізняється від звичайного SPA: catch-all, parallel та intercepting routes, а також серверний prefetch через TanStack Query.

## Можливості

- **Фільтр за тегом через URL.** Один catch-all маршрут `/notes/filter/[...slug]` обробляє і `/notes/filter/all`, і `/notes/filter/Work`. Кожен відфільтрований вигляд має власне посилання, яким можна поділитися або оновити сторінку.
- **Сайдбар тегів як parallel route.** Меню живе в слоті `@sidebar` layout-а фільтра, незалежно від списку. Завдяки `default.tsx` воно рендериться на будь-якій адресі тегу, навіть після повного оновлення сторінки.
- **Перегляд нотатки в модалці (intercepting route).** Клік на «View details» відкриває нотатку в модалці поверх списку (`@modal/(.)notes/[id]`), а URL змінюється на `/notes/:id`. Пряме посилання або оновлення сторінки відкриває натомість повну сторінку нотатки. Модалку закривають Esc, клік по фону або кнопка «Назад» у браузері.
- **Серверний prefetch і гідрація.** Сторінки списку та нотатки заздалегідь завантажують дані на сервері (`prefetchQuery` → `dehydrate` → `HydrationBoundary`), тому вже перший рендер містить нотатки. Далі пошук і пагінацію на клієнті веде TanStack Query.
- **Пошук і пагінація.** Пошук має debounce 500 мс (`use-debounce`), пагінація зроблена на `react-paginate`. `keepPreviousData` тримає поточну сторінку на екрані, поки вантажиться наступна, тому список не блимає.
- **Створення нотатки зі збереженою чернеткою.** Форма має власний маршрут (`/notes/action/create`) і працює через form action з React 19 та валідацію Yup. Чернетка зберігається в Zustand із middleware `persist` (localStorage), тож переживає оновлення сторінки й перехід на іншу, а після успішного створення очищується.
- **Видалення з інвалідацією кешу.** Видалення запускає `useMutation`, інвалідує запити `["getNotes"]` і показує toast-сповіщення.
- **SEO-метадані на кожному маршруті.** Головна та сторінка створення мають статичні метадані, а кожен тег і кожна нотатка — `generateMetadata` разом з Open Graph. `fetchNoteById` обгорнуто в `React.cache()`, тому генерація метаданих і рендер сторінки використовують один запит.
- **Межі помилок і завантаження.** Кожен сегмент має власний `error.tsx`, плюс глобальні `not-found.tsx` і `loading.tsx`.

| Перегляд нотатки (intercepted route) | Створення нотатки |
|---|---|
| ![Модалка перегляду нотатки](./docs/screenshots/note-modal.png) | ![Форма створення нотатки](./docs/screenshots/create-note.png) |

## Технології

| Шар | Технологія |
|---|---|
| Фреймворк | Next.js 16 (App Router) + React Compiler |
| Мова | TypeScript (strict) |
| UI | React 19, CSS Modules, modern-normalize |
| Серверний стан | TanStack Query v5 (SSR prefetch + гідрація) |
| Клієнтський стан | Zustand v5 (middleware `persist`) |
| Форми | Form actions з React 19 + Yup |
| HTTP | Axios |
| Допоміжні бібліотеки UI | react-paginate, use-debounce, react-hot-toast |
| Деплой | Vercel |

## Карта маршрутів

```
app/
├─ layout.tsx                    кореневий layout: рендерить {children} і слот {modal}
├─ page.tsx                      /
├─ @modal/
│  ├─ default.tsx                нічого не рендерить, коли модалка закрита
│  └─ (.)notes/[id]/page.tsx     перехоплює /notes/:id при клієнтській навігації → модалка
└─ notes/
   ├─ [id]/page.tsx              /notes/:id — повна сторінка (пряме посилання або оновлення)
   ├─ action/create/page.tsx     /notes/action/create
   └─ filter/
      ├─ layout.tsx              рендерить слот {sidebar} поруч із {children}
      ├─ @sidebar/page.tsx       меню тегів (default.tsx реекспортує його)
      └─ [...slug]/page.tsx      /notes/filter/all | /notes/filter/:tag
```

## Рішення та чому саме так

- **Чому перегляд — intercepting route, а не стан модалки.** Модалка отримує справжній URL: ним можна поділитися, «Назад» її закриває, а оновлення сторінки відкриває повну версію. Через `useState` нічого з цього не зробиш.
- **Чому створення нотатки — окрема сторінка, а не модалка.** Сторінка має власний URL і метадані, а чернетка живе поза компонентом, тому перехід на іншу сторінку її не знищує. Form action з React 19 плюс Yup закривають валідацію без бібліотеки форм.
- **Чому чернетка в Zustand.** Чернетка має пережити і компонент (навігацію), і вкладку (оновлення). Маленький глобальний стор із `persist` робить обидва без провайдера контексту.
- **Чому шар даних в одному файлі.** Усі запити зібрані в `lib/api.ts`, а спільні типи — у `types/note.ts`, тож зміни контракту API робляться в одному місці.

## Запуск

```bash
npm install
```

Створи в корені проєкту файл `.env.local` зі своїм персональним токеном для GoIT NoteHub API:

```
NEXT_PUBLIC_NOTEHUB_TOKEN=your_token_here
```

```bash
npm run dev      # http://localhost:3000
npm run build    # продакшн-білд (заодно перевіряє типи)
npm run lint     # ESLint
```

## Структура

```
app/          маршрути, layout-и, parallel та intercepting слоти
components/   UI-компоненти (NoteList, NoteForm, Modal, SearchBox, Pagination, …)
lib/api.ts    усі запити до API в одному місці
lib/store/    Zustand-стор для чернетки нотатки
types/        спільні TypeScript-типи (Note, NoteTag, NewNote)
```

## Відомі обмеження та план

- [ ] **Мобільна верстка.** Верстка поки desktop-first: сайдбар і тулбар не адаптуються до ширини, меншої за планшетну.
- [ ] **Пошук і сторінка в URL.** Зараз це локальний стан, тому результатом пошуку не можна поділитися, і він губиться після оновлення.
- [ ] **API-токен на сервері.** Токен — змінна `NEXT_PUBLIC_`, тож він потрапляє в браузерний бандл. Для публічного навчального API це прийнятно; у продакшені я б проксіював запити через Route Handlers і тримав токен на сервері.
- [ ] **Зрозумілі дати.** Зараз дати показуються сирим ISO-рядком; планую форматувати їх через `Intl.DateTimeFormat`.
- [ ] **Тести.** Unit-тести для стора та валідації форми (Vitest + React Testing Library).
