# 🐳 Docker Setup - Resumen

## ✅ Archivos Creados

### Configuración Docker

1. **`backend/Dockerfile`** - Production build (multi-stage, Node 22 Alpine)
2. **`backend/Dockerfile.dev`** - Development con hot reload
3. **`backend/.dockerignore`** - Excluye node_modules, dist, etc.

4. **`frontend/Dockerfile`** - Production build (Angular + Nginx)
5. **`frontend/Dockerfile.dev`** - Development con hot reload
6. **`frontend/.dockerignore`** - Excluye node_modules, dist, etc.
7. **`frontend/nginx.conf`** - Nginx config para Angular SPA

8. **`docker-compose.yml`** - Production: Backend + Frontend + PostgreSQL
9. **`docker-compose.dev.yml`** - Development: Hot reload en ambos lados

### Scripts y Configuración

10. **`.env.example`** - Template de variables de entorno
11. **`deploy.sh`** - Script automatizado de deployment con validaciones
12. **`test-local.sh`** - Script para testing de API endpoints

### Documentación

13. **`DEPLOYMENT.md`** - Guía completa de deployment (local + VPS + SSL)
14. **`README.md`** - Documentación principal del proyecto
15. **`DOCKER_SETUP.md`** - Este archivo (resumen de Docker setup)

---

## 🎯 Modos de Uso

### 1. **Desarrollo Local SIN Docker** (Recomendado para desarrollo activo)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

**Ventajas:**
- ✅ Hot reload ultra rápido
- ✅ Debug fácil
- ✅ Sin overhead de Docker

**Acceso:** http://localhost:4200

---

### 2. **Desarrollo Local CON Docker** (Testing de containers)

```bash
# Configurar .env
cp .env.example .env
# Editar .env con DATABASE_URL de Railway

# Levantar servicios de desarrollo
docker-compose -f docker-compose.dev.yml up

# O en background
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

**Ventajas:**
- ✅ Hot reload funciona (volumes montados)
- ✅ Testea configuración de Docker sin build completo
- ✅ Ambiente más cercano a producción

**Acceso:** http://localhost:4200

---

### 3. **Producción Local** (Testing antes de VPS)

```bash
# Configurar .env para producción
cp .env.example .env
# Editar:
# - DATABASE_URL (Railway)
# - CORS_ORIGIN=http://localhost
# - API_URL=http://localhost:3000

# Deploy automatizado
./deploy.sh
```

**El script hace:**
1. Valida variables de entorno
2. Para containers existentes
3. Build sin caché (imágenes limpias)
4. Levanta servicios
5. Verifica health checks
6. Muestra status y URLs

**Acceso:** http://localhost (puerto 80, no 4200)

---

### 4. **Deployment en VPS**

Ver **[DEPLOYMENT.md](./DEPLOYMENT.md)** para guía paso a paso.

**Quick start:**

```bash
# En VPS
git clone <repo> gastos-compartidos
cd gastos-compartidos
cp .env.example .env
nano .env  # Configurar variables

# Deploy
./deploy.sh
```

**Con Nginx reverse proxy (recomendado):**
- Todo por puerto 80/443
- HTTPS con Let's Encrypt
- Sin exponer puerto 3000

---

## 📁 Estructura de Archivos Docker

```
gastos-compartidos/
├── docker-compose.yml          # Production: build completo, nginx
├── docker-compose.dev.yml      # Development: hot reload, dev servers
├── deploy.sh                   # Script automatizado de deploy
├── test-local.sh               # Testing de API
├── .env.example                # Template de variables
├── .env                        # TUS variables (git ignored)
├── DEPLOYMENT.md               # Guía completa
├── README.md                   # Documentación principal
├── DOCKER_SETUP.md             # Este archivo
│
├── backend/
│   ├── Dockerfile              # Production: multi-stage build
│   ├── Dockerfile.dev          # Development: sin build, hot reload
│   └── .dockerignore
│
└── frontend/
    ├── Dockerfile              # Production: Angular build + nginx
    ├── Dockerfile.dev          # Development: ng serve hot reload
    ├── nginx.conf              # Nginx para SPA routing
    └── .dockerignore
```

---

## 🔧 Variables de Entorno

**Archivo:** `.env` (creá desde `.env.example`)

### Opción 1: Usar Railway DB (Recomendado)

```bash
# Database (Railway - ya tenés datos)
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/railway

# CORS (tu dominio o localhost)
CORS_ORIGIN=http://localhost

# API URL para frontend (en producción: tu dominio)
API_URL=http://localhost:3000
```

**Ventajas:**
- ✅ Base de datos ya configurada con datos
- ✅ Backups automáticos
- ✅ No ocupás espacio en VPS

### Opción 2: Usar PostgreSQL local de Docker

```bash
# PostgreSQL local
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_DB=gastos_compartidos

# Database URL apunta a container local
DATABASE_URL=postgresql://postgres:tu_password_seguro@db:5432/gastos_compartidos

CORS_ORIGIN=http://localhost
API_URL=http://localhost:3000
```

**Ventajas:**
- ✅ Todo local, sin dependencias externas
- ❌ Perdés datos si hacés `docker-compose down -v`

---

## 🚀 Scripts Útiles

### Deploy automatizado
```bash
./deploy.sh
```
- Valida `.env`
- Build + up + health checks
- Muestra errores si algo falla

### Testing de API
```bash
./test-local.sh
```
- Verifica backend en puerto 3000
- Verifica frontend (4200 o 80)
- Testea todos los endpoints
- Muestra responses con `jq`

### Docker Compose comandos

```bash
# Production
docker-compose up -d              # Levantar
docker-compose down               # Detener
docker-compose logs -f            # Ver logs
docker-compose ps                 # Estado
docker-compose restart            # Reiniciar
docker-compose build --no-cache   # Rebuild forzado

# Development
docker-compose -f docker-compose.dev.yml up
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f backend
```

---

## 🔍 Health Checks

Todos los servicios tienen health checks configurados:

### Backend
```bash
curl http://localhost:3000/health
# { "status": "ok", "timestamp": "..." }
```

### Frontend
```bash
curl http://localhost/health
# OK
```

### PostgreSQL (si usás Docker DB)
```bash
docker-compose exec db pg_isready -U postgres
```

---

## 🐛 Troubleshooting

### Backend no arranca

```bash
# Ver logs
docker-compose logs backend

# Verificar variables
docker-compose exec backend env | grep DATABASE_URL

# Conectar a container
docker-compose exec backend sh

# Correr migrations manualmente
docker-compose exec backend npm run db:migrate
```

### Frontend no carga API

```bash
# Verificar que API_URL se aplicó en build
docker-compose exec frontend cat /usr/share/nginx/html/main.*.js | grep apiUrl

# Si está mal, rebuild con .env correcto
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### CORS errors

Verificá en `.env`:
```bash
CORS_ORIGIN=http://localhost  # Debe coincidir con URL del browser
```

Rebuild backend:
```bash
docker-compose restart backend
```

### PostgreSQL connection failed

Si usás Railway:
```bash
# Verificar DATABASE_URL
cat .env | grep DATABASE_URL

# Testear conexión desde host
psql postgresql://postgres:PASS@HOST:PORT/railway
```

Si usás Docker local:
```bash
# Verificar que container está up
docker-compose ps db

# Ver logs de PostgreSQL
docker-compose logs db

# Conectar manualmente
docker-compose exec db psql -U postgres -d gastos_compartidos
```

---

## 📊 Arquitectura

### Development Mode
```
┌─────────────────────────────────────────┐
│     docker-compose.dev.yml              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Frontend    │  │   Backend    │   │
│  │  ng serve    │  │  tsx watch   │   │
│  │  Port: 4200  │  │  Port: 3000  │   │
│  │  HOT RELOAD  │  │  HOT RELOAD  │   │
│  └──────────────┘  └──────────────┘   │
│         │                  │            │
│    Volume mount       Volume mount     │
│    ./src → /app/src   ./src → /app/src │
│                           │             │
│                    ┌──────▼──────┐     │
│                    │ PostgreSQL  │     │
│                    └─────────────┘     │
└─────────────────────────────────────────┘
```

### Production Mode
```
┌─────────────────────────────────────────┐
│       docker-compose.yml                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Frontend    │  │   Backend    │   │
│  │  nginx       │  │  Node.js     │   │
│  │  Port: 80    │  │  Port: 3000  │   │
│  │  OPTIMIZED   │  │  COMPILED    │   │
│  └──────────────┘  └──────────────┘   │
│         │                  │            │
│    Static files      TypeScript        │
│    (compiled)        (compiled)         │
│                           │             │
│                    ┌──────▼──────┐     │
│                    │ PostgreSQL  │     │
│                    │ (opcional)  │     │
│                    └─────────────┘     │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist de Deployment

### Pre-deployment
- [ ] `.env` configurado con valores correctos
- [ ] `DATABASE_URL` apunta a Railway (o DB local configurada)
- [ ] `CORS_ORIGIN` configurado con dominio correcto
- [ ] `API_URL` configurado con URL pública

### Local Testing
- [ ] `./test-local.sh` pasa todos los tests
- [ ] Frontend carga en browser
- [ ] Podés hacer login con PIN
- [ ] Podés crear gastos, pagos, etc.

### VPS Deployment
- [ ] Docker y Docker Compose instalados en VPS
- [ ] Código subido vía git o scp
- [ ] Firewall configurado (puertos 80, 443, 3000)
- [ ] `./deploy.sh` ejecutado exitosamente
- [ ] Health checks pasan (backend + frontend)
- [ ] SSL configurado (Let's Encrypt)
- [ ] Nginx reverse proxy (opcional pero recomendado)

### Post-deployment
- [ ] Backups de base de datos configurados
- [ ] Monitoreo de logs (`docker-compose logs -f`)
- [ ] Plan de updates (git pull + redeploy)

---

## 🎓 Recursos

- **Docker Docs:** https://docs.docker.com/
- **Docker Compose:** https://docs.docker.com/compose/
- **Nginx:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/
- **Railway:** https://railway.app/

---

## 💡 Tips

1. **Desarrollo:** Usá modo local sin Docker para velocidad
2. **Testing:** Usá `docker-compose.dev.yml` para probar containers
3. **Deploy:** Usá `./deploy.sh` siempre (valida y hace health checks)
4. **Logs:** `docker-compose logs -f` es tu mejor amigo
5. **Rebuild:** Si algo no funciona, `--no-cache` puede salvarte
6. **Railway DB:** Más confiable que DB local de Docker para producción
7. **Nginx reverse proxy:** Simplifica SSL y evita CORS issues
8. **Backups:** Railway los hace automático, Docker local NO

---

**¿Dudas?** Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para guía completa paso a paso.
