FROM node:18

# Встановлюємо лише необхідне для Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копіюємо лише package.json
COPY package.json ./

# Встановлюємо залежності (без оновлення npm)
RUN npm install --legacy-peer-deps

# Копіюємо схему та генеруємо клієнт
COPY prisma ./prisma/
RUN npx prisma generate

# Решта коду
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
