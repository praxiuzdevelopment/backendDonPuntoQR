FROM node:22-alpine

WORKDIR /app

# Instalar dependencias primero (capa de cache)
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
