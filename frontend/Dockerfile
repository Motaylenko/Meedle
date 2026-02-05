FROM node:18-slim

WORKDIR /app

# Update npm
RUN npm install -g npm@latest

# Copy package info
COPY package.json ./

# Install dependencies
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copy the rest
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
