FROM node:20

# Встановлюємо необхідне для Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копіюємо package.json
COPY package.json ./

# Встановлюємо залежності
RUN npm install --legacy-peer-deps

# Копіюємо схему та генеруємо клієнт
COPY prisma ./prisma/
RUN npx prisma generate

# Решта коду
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
