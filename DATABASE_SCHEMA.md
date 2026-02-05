# 📊 Діаграма бази даних Meedle

## ER-діаграма (Entity-Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MEEDLE DATABASE SCHEMA                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       USERS          │
├──────────────────────┤
│ id (PK)              │
│ email (UNIQUE)       │
│ name                 │
│ avatar               │
│ rating               │
│ rank                 │
│ coursesCount         │
│ completedTasks       │
│ createdAt            │
│ updatedAt            │
└──────────┬───────────┘
           │
           │ 1:1
           │
           ▼
┌──────────────────────┐
│   USER_SETTINGS      │
├──────────────────────┤
│ id (PK)              │
│ userId (FK, UNIQUE)  │
│ theme                │
│ emailNotifications   │
│ pushNotifications    │
│ scheduleNotifications│
│ createdAt            │
│ updatedAt            │
└──────────────────────┘

           │
           │ 1:M
           │
           ▼
┌──────────────────────┐         ┌──────────────────────┐
│    ENROLLMENTS       │ M:N     │      COURSES         │
├──────────────────────┤◄───────►├──────────────────────┤
│ id (PK)              │         │ id (PK)              │
│ userId (FK)          │         │ name                 │
│ courseId (FK)        │         │ teacher              │
│ progress             │         │ color                │
│ enrolledAt           │         │ materials            │
│ updatedAt            │         │ assignments          │
└──────────────────────┘         │ description          │
                                 │ createdAt            │
                                 │ updatedAt            │
                                 └──────────┬───────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    │ 1:M                   │ 1:M                   │ 1:M
                    ▼                       ▼                       ▼
         ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
         │    SCHEDULES     │   │      GRADES      │   │      TASKS       │
         ├──────────────────┤   ├──────────────────┤   ├──────────────────┤
         │ id (PK)          │   │ id (PK)          │   │ id (PK)          │
         │ courseId (FK)    │   │ userId (FK)      │   │ userId (FK)      │
         │ day              │   │ courseId (FK)    │   │ courseId (FK)    │
         │ date             │   │ name             │   │ title            │
         │ time             │   │ grade            │   │ description      │
         │ endTime          │   │ maxGrade         │   │ deadline         │
         │ room             │   │ date             │   │ status           │
         │ type             │   │ createdAt        │   │ points           │
         │ createdAt        │   │ updatedAt        │   │ createdAt        │
         │ updatedAt        │   └──────────────────┘   │ updatedAt        │
         └──────────────────┘                          └──────────────────┘


┌──────────────────────┐
│    LEADERBOARD       │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ points               │
│ avatar               │
│ trend                │
│ createdAt            │
│ updatedAt            │
└──────────────────────┘
```

---

## Зв'язки між таблицями:

### 1. **User ↔ UserSettings** (One-to-One)
- Один користувач має одні налаштування
- `UserSettings.userId` → `User.id`

### 2. **User ↔ Enrollment ↔ Course** (Many-to-Many)
- Користувач може бути записаний на багато курсів
- Курс може мати багато студентів
- `Enrollment.userId` → `User.id`
- `Enrollment.courseId` → `Course.id`

### 3. **User → Grade** (One-to-Many)
- Користувач має багато оцінок
- `Grade.userId` → `User.id`

### 4. **Course → Grade** (One-to-Many)
- Курс має багато оцінок
- `Grade.courseId` → `Course.id`

### 5. **User → Task** (One-to-Many)
- Користувач має багато завдань
- `Task.userId` → `User.id`

### 6. **Course → Task** (One-to-Many)
- Курс має багато завдань
- `Task.courseId` → `Course.id`

### 7. **Course → Schedule** (One-to-Many)
- Курс має багато занять у розкладі
- `Schedule.courseId` → `Course.id`

### 8. **Leaderboard** (Standalone)
- Незалежна таблиця для рейтингу

---

## Індекси та обмеження:

### Primary Keys (PK):
- Всі таблиці мають `id` як первинний ключ

### Foreign Keys (FK):
- `UserSettings.userId` → `User.id` (ON DELETE CASCADE)
- `Enrollment.userId` → `User.id` (ON DELETE CASCADE)
- `Enrollment.courseId` → `Course.id` (ON DELETE CASCADE)
- `Grade.userId` → `User.id` (ON DELETE CASCADE)
- `Grade.courseId` → `Course.id` (ON DELETE CASCADE)
- `Task.userId` → `User.id` (ON DELETE CASCADE)
- `Task.courseId` → `Course.id` (ON DELETE CASCADE)
- `Schedule.courseId` → `Course.id` (ON DELETE CASCADE)

### Unique Constraints:
- `User.email` - UNIQUE
- `UserSettings.userId` - UNIQUE
- `Enrollment(userId, courseId)` - UNIQUE (composite)

---

## Типи даних:

| Поле | Тип | Опис |
|------|-----|------|
| id | Integer | Автоінкремент |
| email | String | Email адреса |
| name | String | Ім'я |
| avatar | String | Емодзі або URL |
| rating | Integer | Рейтинг користувача |
| progress | Integer | Прогрес (0-100) |
| grade | Float | Оцінка |
| date | DateTime | Дата та час |
| theme | String | light/dark |
| status | String | pending/in-progress/completed |
| type | String | lecture/practice/lab |
| trend | String | up/down/same |

---

## Приклади запитів:

### 1. Отримати користувача з налаштуваннями:
```javascript
const user = await prisma.user.findUnique({
  where: { email: 'student@meedle.edu' },
  include: { settings: true }
});
```

### 2. Отримати курси користувача з прогресом:
```javascript
const userCourses = await prisma.enrollment.findMany({
  where: { userId: 1 },
  include: { course: true }
});
```

### 3. Отримати розклад на сьогодні:
```javascript
const today = new Date();
const schedule = await prisma.schedule.findMany({
  where: {
    date: {
      gte: today,
      lt: new Date(today.getTime() + 24*60*60*1000)
    }
  },
  include: { course: true }
});
```

### 4. Отримати середній бал по курсу:
```javascript
const avgGrade = await prisma.grade.aggregate({
  where: { courseId: 1 },
  _avg: { grade: true }
});
```

### 5. Отримати активні завдання:
```javascript
const tasks = await prisma.task.findMany({
  where: {
    userId: 1,
    status: { not: 'completed' }
  },
  include: { course: true },
  orderBy: { deadline: 'asc' }
});
```

---

## Міграції:

### Створення міграції:
```bash
npx prisma migrate dev --name init
```

### Застосування міграції:
```bash
npx prisma migrate deploy
```

### Скидання бази даних:
```bash
npx prisma migrate reset
```

---

## Seed дані:

Файл `prisma/seed.js` містить:
- 1 тестовий користувач
- 4 курси
- 4 записи на курси
- 6 занять у розкладі
- 4 оцінки
- 3 завдання
- 6 записів у рейтингу

Запуск:
```bash
npm run db:seed
```
