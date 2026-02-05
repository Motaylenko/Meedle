# 🚀 Інструкція з інтеграції Prisma

## 📋 Що було зроблено:

1. ✅ Створено `.env` файл з підключенням до бази даних
2. ✅ Створено Prisma схему (`prisma/schema.prisma`)
3. ✅ Створено seed файл для початкових даних (`prisma/seed.js`)
4. ✅ Оновлено `package.json` з Prisma скриптами

---

## 🔧 Наступні кроки:

### 1️⃣ Встановіть залежності (якщо ще не встановлені):

```bash
cd backend
npm install
```

### 2️⃣ Згенеруйте Prisma Client:

```bash
npm run db:generate
```

### 3️⃣ Створіть міграцію та застосуйте її до бази даних:

```bash
npm run db:migrate
```

Або використайте `db:push` для швидкого прототипування (без створення файлів міграцій):

```bash
npm run db:push
```

### 4️⃣ Заповніть базу даних початковими даними:

```bash
npm run db:seed
```

### 5️⃣ (Опціонально) Відкрийте Prisma Studio для перегляду даних:

```bash
npm run db:studio
```

---

## 🐳 Робота з Docker:

### Запустіть базу даних через Docker:

```bash
docker-compose up db -d
```

### Перевірте, що база даних працює:

```bash
docker-compose ps
```

### Виконайте міграції всередині Docker контейнера:

```bash
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

---

## 📊 Структура бази даних:

### Таблиці:
- **users** - користувачі системи
- **user_settings** - налаштування користувачів
- **courses** - курси
- **enrollments** - зв'язок користувачів та курсів (Many-to-Many)
- **schedules** - розклад занять
- **grades** - оцінки
- **tasks** - завдання
- **leaderboard** - рейтинг студентів

### Зв'язки:
- User ↔ Enrollment ↔ Course (Many-to-Many)
- User → UserSettings (One-to-One)
- User → Grades (One-to-Many)
- User → Tasks (One-to-Many)
- Course → Schedules (One-to-Many)
- Course → Grades (One-to-Many)
- Course → Tasks (One-to-Many)

---

## 🔍 Корисні команди:

### Перегляд статусу міграцій:
```bash
npx prisma migrate status
```

### Скидання бази даних (ОБЕРЕЖНО!):
```bash
npx prisma migrate reset
```

### Форматування schema файлу:
```bash
npx prisma format
```

### Валідація schema:
```bash
npx prisma validate
```

---

## 📝 Приклад використання Prisma Client:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Отримати всіх користувачів
const users = await prisma.user.findMany();

// Отримати користувача з налаштуваннями
const user = await prisma.user.findUnique({
  where: { email: 'student@meedle.edu' },
  include: { settings: true }
});

// Створити новий курс
const course = await prisma.course.create({
  data: {
    name: 'Новий курс',
    teacher: 'Викладач',
    color: 'hsl(200, 50%, 50%)',
  }
});

// Оновити прогрес
await prisma.enrollment.update({
  where: { id: 1 },
  data: { progress: 85 }
});
```

---

## ⚠️ Важливо:

1. **Не забудьте** додати `.env` до `.gitignore`
2. **Завжди** виконуйте `npm run db:generate` після зміни schema
3. **Використовуйте міграції** для production середовища
4. **Використовуйте db:push** тільки для розробки

---

## 🆘 Проблеми та рішення:

### Помилка підключення до бази даних:
- Перевірте, чи запущений PostgreSQL (Docker)
- Перевірте DATABASE_URL в `.env`
- Перевірте, чи правильні credentials

### Prisma Client не знайдено:
```bash
npm run db:generate
```

### Зміни в schema не застосовуються:
```bash
npm run db:generate
npm run db:push
```

---

## 📚 Додаткові ресурси:

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
