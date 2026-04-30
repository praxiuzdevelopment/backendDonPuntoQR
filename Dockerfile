FROM node:22-alpine

WORKDIR /app

# Instalar dependencias primero (capa de cache)
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente específico (Seguridad SonarQube)
COPY src/ src/
COPY db-tasks.js .

# Correr como usuario sin privilegios root (Security Hotspot)
USER node
EXPOSE 3000

CMD ["node", "src/app.js"]
