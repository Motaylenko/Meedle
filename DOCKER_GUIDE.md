# Meedle - Docker Guide

## Переваги Docker версії

- ✅ Не потрібно встановлювати Node.js локально
- ✅ Автоматичне налаштування бази даних PostgreSQL
- ✅ Ізольоване середовище для кожного сервісу
- ✅ Однакова поведінка на всіх операційних системах
- ✅ Легке очищення та перезапуск

## Вимоги

- **Docker Desktop** - [Завантажити тут](https://www.docker.com/products/docker-desktop)
  - Для Windows: Docker Desktop for Windows
  - Переконайтеся, що Docker Desktop запущений перед використанням

## Швидкий старт

### 1. Перший запуск (Setup)

```batch
setup.bat
```

Цей скрипт запропонує вибрати метод налаштування:
- **[1] Docker (Рекомендовано)** - автоматичне налаштування Docker
- **[2] Local (Вручну)** - встановлення залежностей через npm

Для Docker версії скрипт:
- Перевірить наявність Docker
- Завантажить необхідні образи
- Побудує контейнери для проекту

### 2. Запуск додатку

```batch
start.bat
```

Цей скрипт:
- Зупинить старі контейнери (якщо є)
- Запустить всі сервіси (Frontend, Backend, Database)
- Автоматично відкриє браузер

### 3. Зупинка додатку

```batch
stop.bat
```

Або використовуйте:
```batch
docker compose down
```

## Доступ до сервісів

Після запуску `start.bat`:

- **Frontend (React)**: http://localhost:3000
- **Backend (API)**: http://localhost:5000
- **Database (PostgreSQL)**: localhost:5432
  - User: `meedle_user`
  - Password: `meedle_password`
  - Database: `meedle_db`

## Корисні команди

### Перегляд логів

```batch
# Всі сервіси
docker compose logs -f

# Тільки frontend
docker compose logs -f frontend

# Тільки backend
docker compose logs -f backend

# Тільки база даних
docker compose logs -f db
```

### Перезапуск окремого сервісу

```batch
docker compose restart frontend
docker compose restart backend
docker compose restart db
```

### Перебудова контейнерів

```batch
docker compose up -d --build
```

### Повне очищення (видалення всіх даних)

```batch
docker compose down -v
```

⚠️ **Увага**: Це видалить всі дані з бази даних!

### Вхід в контейнер

```batch
# Frontend
docker compose exec frontend sh

# Backend
docker compose exec backend sh

# Database
docker compose exec db psql -U meedle_user -d meedle_db
```

## Структура Docker

```
Meedle/
├── docker-compose.yml          # Конфігурація всіх сервісів
├── frontend/
│   ├── Dockerfile             # Образ для React додатку
│   └── .dockerignore          # Виключення для Docker
├── backend/
│   ├── Dockerfile             # Образ для Node.js API
│   └── .dockerignore          # Виключення для Docker
├── start.bat                  # Запуск через Docker
├── stop.bat                   # Зупинка контейнерів
└── setup-docker.bat           # Початкове налаштування
```

## Troubleshooting

### Docker не запускається

1. Переконайтеся, що Docker Desktop запущений
2. Перевірте версію: `docker --version`
3. Перезапустіть Docker Desktop

### Порти зайняті

Якщо порти 3000, 5000 або 5432 вже використовуються:

1. Зупиніть інші програми, що використовують ці порти
2. Або змініть порти в `docker-compose.yml`

### Зміни в коді не відображаються

1. Перевірте, що volume mapping працює
2. Для Windows переконайтеся, що `CHOKIDAR_USEPOLLING=true` встановлено
3. Перезапустіть контейнер: `docker compose restart frontend`

### Помилки при збірці

```batch
# Очистіть все і почніть заново
docker compose down -v
docker system prune -a
setup-docker.bat
start.bat
```

## Порівняння: Docker vs Локальний запуск

| Аспект | Docker | Локальний |
|--------|--------|-----------|
| Node.js | Не потрібен | Потрібен |
| PostgreSQL | Автоматично | Потрібно встановити |
| Налаштування | Просте | Складніше |
| Ізоляція | Повна | Немає |
| Продуктивність | Трохи повільніше | Швидше |
| Портативність | Висока | Низька |

## Міграція з локального запуску

Якщо ви раніше використовували `npm install` локально:

1. Можете видалити локальні `node_modules`:
   ```batch
   rmdir /s /q frontend\node_modules
   rmdir /s /q backend\node_modules
   ```

2. Запустіть Docker версію:
   ```batch
   setup-docker.bat
   start.bat
   ```

3. Старі скрипти (`setup.bat` без Docker) все ще працюють для локального запуску

## Підтримка

Для отримання додаткової інформації:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
