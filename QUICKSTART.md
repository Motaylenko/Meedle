# ⚡ Швидкий старт Meedle

## ⚠️ Передумова: Node.js

**Перш ніж почати, встановіть Node.js:**
- Завантажте з https://nodejs.org/ (LTS версія)
- Перевірте: `node --version` та `npm --version`
- Якщо npm не працює → читайте [INSTALL_NODEJS.md](./INSTALL_NODEJS.md)

---

## Мінімальні кроки для запуску:

### 1. Встановіть залежності

```powershell
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Запустіть проєкт

Відкрийте **2 термінали**:

**Термінал 1 (Backend):**
```powershell
cd backend
npm run dev
```

**Термінал 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

### 3. Відкрийте браузер

Перейдіть на: **http://localhost:5173**

---

## ✅ Готово!

Проєкт працює з демо-даними, база даних не потрібна.

Детальна інструкція: [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)
