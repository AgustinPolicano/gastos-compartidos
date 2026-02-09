# --- ETAPA 1: BUILDER ---
  FROM node:22-alpine AS builder

  WORKDIR /app
  
  # Copiamos archivos de dependencias
  COPY package*.json ./
  COPY tsconfig.json ./
  
  # 1. Instalamos TODO (incluyendo devDependencies como TypeScript)
  # Usamos --ignore-scripts para que NO se ejecute 'postinstall' automáticamente y falle
  RUN npm install --ignore-scripts
  
  # Copiamos el código fuente
  COPY src ./src
  COPY drizzle ./drizzle
  
  # 2. Ahora sí, ejecutamos el build manualmente
  RUN npm run build
  
  # --- ETAPA 2: PRODUCTION ---
  FROM node:22-alpine
  
  WORKDIR /app
  
  # Copiamos package.json
  COPY package*.json ./
  
  # 3. Instalamos SOLO dependencias de producción
  # Usamos 'npm install' en vez de 'ci' para evitar errores de lockfile
  RUN npm install --omit=dev --ignore-scripts
  
  # Copiamos lo que construimos en la etapa anterior
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/drizzle ./drizzle
  
  # Archivos necesarios para migraciones
  COPY tsconfig.json ./
  COPY src/db/migrate.ts ./src/db/migrate.ts
  
  # Instalamos tsx para correr las migraciones en producción
  RUN npm install tsx --save-prod
  
  EXPOSE 3000
  
  # Healthcheck
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
  CMD ["npm", "start"]