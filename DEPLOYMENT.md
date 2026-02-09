# Deployment Guide - Gastos Compartidos

## 📋 Pre-requisitos

- Docker y Docker Compose instalados
- Acceso SSH a tu VPS
- Base de datos PostgreSQL (Railway o local)

## 🚀 Deployment Local (Testing)

### 1. Configurar variables de entorno

```bash
# Copiar ejemplo y editar
cp .env.example .env
nano .env
```

**Configuración recomendada (usando Railway DB):**

```bash
# Usar tu DB de Railway (ya tiene datos)
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway

# CORS para desarrollo local
CORS_ORIGIN=http://localhost

# API URL para el frontend
API_URL=http://localhost:3000
```

### 2. Deploy con script automatizado

```bash
./deploy.sh
```

El script:
- Valida variables de entorno
- Para containers existentes
- Buildea imágenes limpias
- Levanta los servicios
- Verifica health checks

### 3. Acceder a la app

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

### 4. Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### 5. Detener servicios

```bash
docker-compose down

# Detener y eliminar volumes (CUIDADO: borra datos de DB local)
docker-compose down -v
```

---

## 🌐 Deployment en VPS

### 1. Preparar VPS

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose -y

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
# Logout y login para aplicar cambios
```

### 2. Subir código al VPS

**Opción A: Git (recomendado)**

```bash
# En VPS
git clone <tu-repo> gastos-compartidos
cd gastos-compartidos
```

**Opción B: SCP**

```bash
# Desde tu máquina local
scp -r gastos-compartidos user@vps-ip:/home/user/
```

### 3. Configurar variables de entorno

```bash
# En VPS
cd gastos-compartidos
cp .env.example .env
nano .env
```

**Ejemplo para VPS:**

```bash
# Base de datos Railway
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway

# Reemplazar con tu dominio o IP
CORS_ORIGIN=http://tu-dominio.com
API_URL=http://tu-dominio.com:3000

# Si usás DB local de Docker (no recomendado para producción)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password_super_seguro
POSTGRES_DB=gastos_compartidos
```

### 4. Deploy

```bash
./deploy.sh
```

### 5. Configurar firewall

```bash
# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # API Backend
sudo ufw enable
```

### 6. (Opcional) Configurar Nginx como reverse proxy

Si querés que todo vaya por el puerto 80/443:

```nginx
# /etc/nginx/sites-available/gastos-compartidos
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gastos-compartidos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Con esta config, actualizá tu `.env`:

```bash
API_URL=http://tu-dominio.com  # No port 3000
CORS_ORIGIN=http://tu-dominio.com
```

Y rebuild:

```bash
./deploy.sh
```

### 7. (Opcional) SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu-dominio.com
```

Actualizá `.env`:

```bash
API_URL=https://tu-dominio.com
CORS_ORIGIN=https://tu-dominio.com
```

---

## 🏗️ Arquitectura Docker

```
┌─────────────────────────────────────────┐
│          Docker Compose                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Frontend    │  │   Backend    │   │
│  │  (nginx)     │  │  (Node.js)   │   │
│  │  Port: 80    │  │  Port: 3000  │   │
│  └──────────────┘  └──────────────┘   │
│         │                  │            │
│         │                  │            │
│         │           ┌──────▼──────┐    │
│         │           │  PostgreSQL │    │
│         │           │  (opcional) │    │
│         │           └─────────────┘    │
│         │                               │
└─────────┼───────────────────────────────┘
          │
          ▼
     Usuario (Browser)
```

**Opciones de Base de Datos:**

1. **Railway (Recomendado):** Ya tenés los datos, solo conectás via `DATABASE_URL`
2. **Docker local:** El `docker-compose.yml` incluye PostgreSQL, pero perdés datos al hacer `down -v`

---

## 🔧 Troubleshooting

### Backend no arranca

```bash
# Ver logs
docker-compose logs backend

# Verificar DATABASE_URL
docker-compose exec backend env | grep DATABASE_URL

# Probar conexión a DB manualmente
docker-compose exec backend npm run db:migrate
```

### Frontend muestra error de API

```bash
# Verificar API_URL se aplicó correctamente
docker-compose exec frontend cat /usr/share/nginx/html/main.*.js | grep apiUrl

# Verificar CORS en backend
docker-compose logs backend | grep CORS
```

### Rebuild forzado

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Health checks fallan

```bash
# Verificar containers corriendo
docker-compose ps

# Reiniciar todo
docker-compose restart

# Ver health status
docker inspect gastos-backend | grep Health -A 10
```

---

## 📊 Monitoreo

### Logs en tiempo real

```bash
docker-compose logs -f --tail=100
```

### Uso de recursos

```bash
docker stats
```

### Verificar health

```bash
# Backend
curl http://localhost:3000/health

# Frontend
curl http://localhost/health
```

---

## 🔄 Updates

### Actualizar código

```bash
# Pull cambios
git pull origin main

# Rebuild y redeploy
./deploy.sh
```

### Backup de DB (si usás Docker local)

```bash
# Exportar
docker-compose exec db pg_dump -U postgres gastos_compartidos > backup.sql

# Importar
docker-compose exec -T db psql -U postgres gastos_compartidos < backup.sql
```

---

## 🛡️ Seguridad

### Production Checklist

- [ ] Cambiar `POSTGRES_PASSWORD` en `.env`
- [ ] Configurar `CORS_ORIGIN` con tu dominio específico (no `*`)
- [ ] Usar HTTPS (Let's Encrypt)
- [ ] Firewall configurado (solo puertos necesarios)
- [ ] Backups automáticos de DB
- [ ] Monitoreo de logs
- [ ] Rate limiting en nginx (opcional)

### Variables sensibles

**NUNCA** commitear `.env` al repo. El `.gitignore` ya lo excluye, pero verificá:

```bash
git status | grep .env  # No debería aparecer
```

---

## 💡 Tips

- **Railway DB:** Recomendado para producción (backups, escalabilidad)
- **Docker DB local:** Solo para testing local
- **Nginx reverse proxy:** Simplifica CORS y SSL
- **Logs:** Configurá rotación para evitar llenar disco
- **Updates:** Probá primero en local con `./deploy.sh`
