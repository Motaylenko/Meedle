FROM node:20

# Встановлюємо необхідне для Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копіюємо package.json
COPY package.json ./

# Встановлюємо залежності
RUN npm install --legacy-peer-deps

# Копіюємо весь код (включаючи папку prisma)
COPY . .

EXPOSE 5000

# Генерація буде відбуватися під час старту або через setup.bat
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
