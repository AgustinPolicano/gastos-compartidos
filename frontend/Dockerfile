# Frontend Dockerfile
FROM node:22-alpine AS builder

# Build argument for API URL
ARG API_URL=http://localhost:3000

WORKDIR /app

# Copy package files
COPY package*.json ./

# --- CAMBIO IMPORTANTE ---
# Instalamos TODO (dev + prod) para tener el comando 'ng' disponible
RUN npm install 

# Copy source code
COPY . .

# Replace API URL in environment file
RUN sed -i "s|http://localhost:3000|${API_URL}|g" src/environments/environment.prod.ts

# Build Angular app for production
RUN npm run build

# --- ETAPA FINAL (NGINX) ---
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx site config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder
# OJO: Asegurate que 'frontend' sea el nombre de tu proyecto en angular.json
# Si falla el copy, verificá si la carpeta es dist/gastos-compartidos/browser
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]