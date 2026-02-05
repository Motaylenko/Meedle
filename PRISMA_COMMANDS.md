# ⚡ Швидкі команди Prisma

## 🚀 Початкове налаштування:

```bash
# 1. Встановити залежності
cd backend
npm install

# 2. Згенерувати Prisma Client
npm run db:generate

# 3. Створити таблиці
npm run db:push

# 4. Заповнити даними
npm run db:seed

# 5. Запустити сервер
node src/index-prisma.js
```

---

## 🐳 Docker команди:

```bash
# Запустити тільки БД
docker-compose up db -d

# Запустити весь проєкт
docker-compose up

# Зупинити
docker-compose down

# Переглянути логи
docker-compose logs -f backend

# Виконати команди в контейнері
docker-compose exec backend npm run db:generate
docker-compose exec backend npm run db:push
docker-compose exec backend npm run db:seed
```

---

## 🛠️ Робота з Prisma:

```bash
# Згенерувати Client
npm run db:generate

# Застосувати схему (без міграцій)
npm run db:push

# Створити міграцію
npm run db:migrate

# Заповнити БД
npm run db:seed

# Відкрити Prisma Studio
npm run db:studio

# Форматувати schema
npx prisma format

# Валідувати schema
npx prisma validate

# Переглянути статус міграцій
npx prisma migrate status

# Скинути БД (ОБЕРЕЖНО!)
npx prisma migrate reset
```

---

## 🔍 Тестування API:

```bash
# Перевірка здоров'я
curl http://localhost:5000/api/health

# Отримати курси
curl http://localhost:5000/api/courses

# Отримати розклад
curl http://localhost:5000/api/schedule

# Отримати оцінки
curl http://localhost:5000/api/grades

# Отримати завдання
curl http://localhost:5000/api/tasks

# Отримати користувача
curl http://localhost:5000/api/user

# Отримати рейтинг
curl http://localhost:5000/api/leaderboard
```

---

## 📊 PostgreSQL команди:

```bash
# Підключитися до БД через Docker
docker-compose exec db psql -U meedle_user -d meedle_db

# Переглянути таблиці
\dt

# Переглянути структуру таблиці
\d users

# Вийти
\q
```

---

## 🔄 Заміна файлів:

```powershell
# Windows PowerShell
cd backend\src
Move-Item index.js index-old.js
Move-Item index-prisma.js index.js
```

```bash
# Linux/Mac
cd backend/src
mv index.js index-old.js
mv index-prisma.js index.js
```

---

## 🆘 Вирішення проблем:

```bash
# Перезапустити БД
docker-compose restart db

# Видалити всі контейнери
docker-compose down -v

# Перебудувати контейнери
docker-compose up --build

# Очистити node_modules
rm -rf node_modules
npm install

# Перегенерувати Prisma
npm run db:generate
```

---

## 📝 Git команди:

```bash
# Перевірити статус
git status

# Додати файли
git add .

# Зробити коміт
git commit -m "Add Prisma integration"

# Відправити на GitHub
git push
```

---

## ⚡ Один рядок (все разом):

```bash
# Повне налаштування
cd backend && npm install && npm run db:generate && npm run db:push && npm run db:seed && node src/index-prisma.js
```

```bash
# З Docker
docker-compose up db -d && cd backend && npm install && npm run db:generate && npm run db:push && npm run db:seed && node src/index-prisma.js
```

---

## 🎯 Швидкий старт (копіюй-вставляй):

### Варіант 1: Без Docker
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
node src/index-prisma.js
```

### Варіант 2: З Docker
```bash
docker-compose up db -d
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
node src/index-prisma.js
```

---

## 📚 Корисні посилання:

- Prisma Docs: https://www.prisma.io/docs
- Prisma Schema: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- Prisma Client: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

## 🎉 Готово!

Скопіюйте потрібні команди та виконайте їх! 🚀
