# --- ETAPA 1: BUILDER (Compilación) ---
  FROM node:22-alpine AS builder

  WORKDIR /app
  
  COPY package*.json tsconfig.json ./
  
  # Instalamos TODO (incluido TypeScript) para poder compilar
  # Acá "tsc" sí va a funcionar porque se está instalando
  RUN npm install
  
  COPY src ./src
  COPY drizzle ./drizzle
  
  # Compilamos el código TS a JS
  RUN npm run build
  
  # --- ETAPA 2: PRODUCTION (Ejecución) ---
  FROM node:22-alpine
  
  WORKDIR /app
  
  COPY package*.json ./
  
  # 1. Instalamos herramientas necesarias para compilar bcrypt (Python, Make, GCC)
  RUN apk add --no-cache python3 make g++
  
  # 3. Ahora instalamos dependencias de producción SIN "--ignore-scripts"
  # Gracias al paso 2, tsc no molesta, pero bcrypt sí se compila.
  RUN npm install --omit=dev
  
  # 4. Copiamos solo el código compilado
  COPY --from=builder /app/dist ./dist
  # (Opcional: carpeta drizzle si la usás en runtime, sino borrala)
  COPY --from=builder /app/drizzle ./drizzle
  
  EXPOSE 3000
  
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
  CMD ["npm", "start"]