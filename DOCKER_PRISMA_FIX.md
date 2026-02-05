# 🔧 Виправлення помилки Docker з Prisma

## ❌ Проблема:

При запуску `setup.bat` виникала помилка:
```
ERROR: Failed to build Docker containers!
target backend: failed to solve: process "/bin/sh -c npm install" did not complete successfully: exit code: 1
```

## ✅ Що було виправлено:

### 1. **Оновлено `backend/Dockerfile`**
Додано кроки для Prisma:
- Копіювання папки `prisma/` перед генерацією
- Генерація Prisma Client: `npx prisma generate`
- Правильний порядок копіювання файлів

### 2. **Оновлено `docker-compose.yml`**
- Змінено формат DATABASE_URL: `postgres://` → `postgresql://`
- Додано параметр `?schema=public`
- Додано змінну `NODE_ENV=development`

### 3. **Оновлено `setup.bat`**
Додано автоматичне налаштування Prisma:
- Запуск бази даних
- Генерація Prisma Client
- Застосування схеми (`db:push`)
- Заповнення даними (`db:seed`)

---

## 🚀 Що робити далі:

### Варіант 1: Повторний запуск setup.bat (Рекомендовано)

```bash
# Очистіть старі контейнери
docker compose down -v

# Запустіть setup знову
setup.bat
```

Виберіть опцію `[1] Docker` і дочекайтесь завершення.

### Варіант 2: Ручне налаштування

Якщо `setup.bat` все ще дає помилку:

```bash
# 1. Очистіть Docker
docker compose down -v
docker system prune -f

# 2. Зберіть контейнери
docker compose build --no-cache

# 3. Запустіть базу даних
docker compose up db -d

# 4. Дочекайтесь запуску БД (5-10 секунд)
timeout /t 10

# 5. Налаштуйте Prisma
docker compose run --rm backend npm run db:generate
docker compose run --rm backend npm run db:push
docker compose run --rm backend npm run db:seed

# 6. Запустіть всі сервіси
docker compose up -d

# 7. Перевірте статус
docker compose ps
```

---

## 🔍 Перевірка роботи:

### 1. Перевірте контейнери:
```bash
docker compose ps
```

Має бути 3 контейнери: `frontend`, `backend`, `db`

### 2. Перевірте логи backend:
```bash
docker compose logs backend
```

Має бути:
```
✅ Connected to PostgreSQL database via Prisma
🚀 Meedle API Server running on port 5000
```

### 3. Перевірте API:
Відкрийте: http://localhost:5000/api/health

Має повернути:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 🆘 Якщо все ще не працює:

### Помилка: "Can't reach database server"

```bash
# Перезапустіть базу даних
docker compose restart db

# Дочекайтесь 10 секунд
timeout /t 10

# Повторіть Prisma setup
docker compose exec backend npm run db:push
```

### Помилка: "Prisma Client not found"

```bash
# Згенеруйте Client знову
docker compose exec backend npm run db:generate
```

### Помилка: "Port already in use"

```bash
# Зупиніть всі контейнери
docker compose down

# Перевірте, що порти вільні
netstat -ano | findstr :5000
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Запустіть знову
docker compose up -d
```

---

## 📝 Зміни в файлах:

### `backend/Dockerfile` (ОНОВЛЕНО):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

### `docker-compose.yml` (ОНОВЛЕНО):
```yaml
backend:
  environment:
    - PORT=5000
    - DATABASE_URL=postgresql://meedle_user:meedle_password@db:5432/meedle_db?schema=public
    - NODE_ENV=development
```

---

## ✅ Готово!

Тепер Docker правильно збирає backend з Prisma і автоматично налаштовує базу даних!

**Запустіть:** `setup.bat` → Виберіть `[1] Docker` → Дочекайтесь завершення

**Або:** Використайте ручне налаштування вище ☝️
