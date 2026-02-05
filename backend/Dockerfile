FROM node:18-slim

# Install necessary libraries for Prisma and Node.js
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Update npm to latest
RUN npm install -g npm@latest

# Copy package info
COPY package.json ./
# We don't copy package-lock.json to avoid Windows/Linux conflicts during setup
# If it's absolutely needed, uncomment the next line
# COPY package-lock.json ./

# Install dependencies with flags for better reliability
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
