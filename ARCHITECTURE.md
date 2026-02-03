# 🏗 Архітектура проєкту Meedle

## Загальна схема

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │ ◄─────► │   Frontend   │ ◄─────► │   Backend    │
│  (Client)   │  HTTP   │ (React+Vite) │   API   │ (Node+Express)│
└─────────────┘         └──────────────┘         └──────────────┘
                                                          │
                                                          ▼
                                                  ┌──────────────┐
                                                  │  PostgreSQL  │
                                                  │  (Optional)  │
                                                  └──────────────┘
```

## Компоненти системи

### 1. Frontend (React + Vite)

**Призначення:** Клієнтська частина, інтерфейс користувача

**Технології:**
- React 18 - для побудови UI
- React Router - для маршрутизації
- Vite - для швидкої розробки та збірки
- CSS Variables - для системи дизайну

**Структура:**
```
frontend/src/
├── components/          # Переіспользовані компоненти
│   └── Header.jsx      # Навігація та перемикач теми
├── pages/              # Сторінки додатку
│   ├── Dashboard.jsx   # Головна панель
│   ├── Schedule.jsx    # Розклад
│   ├── Courses.jsx     # Курси
│   ├── Grades.jsx      # Оцінки та рейтинг
│   └── Profile.jsx     # Налаштування
├── services/           # Бізнес-логіка
│   ├── api.js         # HTTP клієнт
│   └── notifications.js # Push-сповіщення
└── styles/            # Стилі
    └── shared.css     # Загальні стилі
```

**Потік даних:**
1. Користувач взаємодіє з UI
2. Компонент викликає API сервіс
3. API сервіс робить HTTP запит до backend
4. Отримані дані оновлюють стан компонента
5. React перерендерює UI

### 2. Backend (Node.js + Express)

**Призначення:** Серверна частина, API для даних

**Технології:**
- Node.js 18 - runtime середовище
- Express - web framework
- pg - PostgreSQL клієнт
- cors - для CORS політики
- dotenv - змінні середовища

**API Endpoints:**

#### Courses (Курси)
- `GET /api/courses` - Список всіх курсів
- `GET /api/courses/:id` - Деталі конкретного курсу

#### Schedule (Розклад)
- `GET /api/schedule` - Повний тижневий розклад
- `GET /api/schedule/today` - Розклад на сьогодні

#### Grades (Оцінки)
- `GET /api/grades` - Оцінки студента з середнім балом

#### Leaderboard (Рейтинг)
- `GET /api/leaderboard` - Повна таблиця лідерів
- `GET /api/leaderboard/top/:count` - Топ N студентів

#### Tasks (Завдання)
- `GET /api/tasks` - Всі завдання
- `GET /api/tasks/active` - Тільки активні завдання
- `POST /api/tasks/:id/status` - Оновити статус завдання

#### User (Користувач)
- `GET /api/user` - Дані поточного користувача
- `PUT /api/user/settings` - Оновити налаштування

#### Dashboard (Панель)
- `GET /api/dashboard/stats` - Статистика для головної панелі

**Обробка запитів:**
```
Request → Middleware (CORS, JSON) → Route Handler → Response
```

### 3. База даних (PostgreSQL)

**Призначення:** Зберігання даних (опціонально)

**Схема даних:**

```sql
-- Users (Користувачі)
users
├── id (PK)
├── name
├── email
├── avatar
├── rating
└── settings (JSON)

-- Courses (Курси)
courses
├── id (PK)
├── name
├── teacher
├── color
└── students_count

-- Schedule (Розклад)
schedule
├── id (PK)
├── course_id (FK)
├── day
├── time
├── room
└── type

-- Grades (Оцінки)
grades
├── id (PK)
├── user_id (FK)
├── course_id (FK)
└── grade

-- Tasks (Завдання)
tasks
├── id (PK)
├── course_id (FK)
├── title
├── description
├── deadline
└── status
```

**Примітка:** Наразі backend працює з mock-даними, БД не обов'язкова.

## Особливості архітектури

### 1. Модульність
Кожна частина системи незалежна:
- Frontend може працювати з будь-яким backend
- Backend може обслуговувати різні клієнти
- БД легко замінити на іншу

### 2. Масштабованість
```
                    ┌─────────────┐
                    │ Load Balancer│
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌────────┐         ┌────────┐         ┌────────┐
   │Backend1│         │Backend2│         │Backend3│
   └────┬───┘         └────┬───┘         └────┬───┘
        └──────────────────┼──────────────────┘
                           ▼
                    ┌─────────────┐
                    │  Database   │
                    └─────────────┘
```

### 3. Безпека

**Frontend:**
- XSS захист через React (автоматичне екранування)
- HTTPS для production
- Валідація даних перед відправкою

**Backend:**
- CORS політика
- Валідація вхідних даних
- Підготовлені запити до БД (SQL injection захист)
- Environment variables для секретів

### 4. Продуктивність

**Frontend:**
- Code splitting (React Router)
- Lazy loading компонентів
- Кешування в localStorage
- Оптимізовані зображення

**Backend:**
- Кешування запитів
- Connection pooling для БД
- Compression middleware
- Rate limiting

## Потік роботи

### Типовий запит (наприклад, завантаження Dashboard):

```
1. User → Browser
   └─ Відкриває http://localhost:5173

2. Browser → Frontend
   └─ Завантажує React додаток

3. Dashboard Component → API Service
   └─ useEffect викликає loadDashboardData()

4. API Service → Backend
   └─ GET /api/dashboard/stats
   └─ GET /api/schedule/today
   └─ GET /api/tasks/active

5. Backend → Database (або Mock Data)
   └─ Виконує запити

6. Backend → API Service
   └─ Повертає JSON дані

7. API Service → Dashboard Component
   └─ Оновлює стан через setState

8. Dashboard Component → Browser
   └─ React рендерить оновлений UI

9. Browser → User
   └─ Відображає дані
```

## Deployment (Розгортання)

### Development (Розробка)
```
Frontend: npm run dev (Vite dev server)
Backend:  npm run dev (Nodemon)
```

### Production (Продакшн)

**Frontend:**
```bash
npm run build  # Створює dist/ папку
# Розгортання на Vercel, Netlify, або Nginx
```

**Backend:**
```bash
npm start  # Production сервер
# Розгортання на Heroku, Railway, або VPS
```

**Docker:**
```bash
docker compose up --build
# Автоматично запускає всі сервіси
```

## Майбутні покращення

### Короткострокові:
- [ ] Автентифікація (JWT)
- [ ] Реальна інтеграція з БД
- [ ] WebSocket для real-time оновлень
- [ ] Файлове сховище для матеріалів

### Довгострокові:
- [ ] Мобільний додаток (React Native)
- [ ] Відеоконференції
- [ ] AI асистент для навчання
- [ ] Інтеграція з LMS системами

## Технічні рішення

### Чому React?
- Велика екосистема
- Швидкий розвиток
- Переіспользовані компоненти
- Хороша документація

### Чому Vite?
- Надшвидкий HMR
- Оптимізована збірка
- Сучасний підхід
- Менше конфігурації

### Чому Node.js + Express?
- JavaScript на frontend і backend
- Велика кількість пакетів
- Async/await для IO операцій
- Легко масштабувати

### Чому PostgreSQL?
- Реляційна модель даних
- ACID транзакції
- Надійність
- Безкоштовна

## Висновок

Архітектура Meedle побудована на сучасних технологіях з фокусом на:
- **Модульність** - легко додавати нові функції
- **Масштабованість** - готовність до зростання
- **Безпеку** - захист даних користувачів
- **Продуктивність** - швидка робота системи
- **Підтримку** - зрозумілий код та структура
