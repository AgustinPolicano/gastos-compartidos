# 🚀 Deploy - Gastos Compartidos

## Backend en Railway

### Opción A: Deploy desde GitHub (Recomendado)

1. **Subir el código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/gastos-compartidos.git
   git push -u origin main
   ```

2. **Crear nuevo servicio en Railway:**
   - Ir a https://railway.app
   - Click en "New Project"
   - Click en "Deploy from GitHub repo"
   - Seleccionar tu repo `gastos-compartidos`

3. **Configurar el servicio:**
   - Railway detectará que es un monorepo
   - En Settings → Build:
     - **Root Directory:** `backend`
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`

4. **Variables de entorno:**
   - En Settings → Variables:
     - `DATABASE_URL`: Ya la tenés de tu PostgreSQL en Railway (vincular)
     - `NODE_ENV`: `production`
     - `PORT`: Railway lo asigna automáticamente
     - `PIN_SALT_ROUNDS`: `10`

5. **Deploy:**
   - Railway hace deploy automático
   - Te da una URL tipo: `https://gastos-compartidos-production.up.railway.app`

---

### Opción B: Deploy con Railway CLI

1. **Instalar Railway CLI:**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Inicializar proyecto:**
   ```bash
   cd backend
   railway init
   ```

3. **Linkear con tu proyecto:**
   ```bash
   railway link
   ```

4. **Variables de entorno:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PIN_SALT_ROUNDS=10
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

---

## Frontend en Vercel

### Deploy del Frontend

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Configurar variables de entorno:**
   - En el dashboard de Vercel → Settings → Environment Variables:
     - `API_URL`: La URL de tu backend en Railway

4. **Actualizar environment.prod.ts:**
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://TU-BACKEND.up.railway.app/api',
   };
   ```

5. **Rebuild y deploy:**
   ```bash
   vercel --prod
   ```

---

## Optimizar Costos en Railway

### Para que NO gaste tanto:

1. **Configurar Sleep Mode:**
   - Settings → Sleep After Inactivity: `1 hour`
   - Se duerme después de 1 hora sin requests
   - Despierta en 2-3 segundos al primer request

2. **Limitar recursos:**
   - Settings → Resources:
     - Memory: 512 MB (suficiente)
     - CPU: 0.5 vCPU

3. **Monitorear uso:**
   - Dashboard → Usage
   - Con $5/mes gratis alcanza para ~200-300 horas
   - Si solo vos y tu pareja lo usan, con sleep mode gastas ~50 horas/mes

---

## CORS en Producción

Actualizar el backend para permitir tu dominio de Vercel:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://TU-APP.vercel.app'
  ]
}));
```

---

## Troubleshooting

### Backend no arranca en Railway:
- Verificar logs: `railway logs`
- Verificar que `DATABASE_URL` esté configurada
- Verificar que las migraciones corrieron: ver logs de build

### Frontend no conecta con el backend:
- Verificar que `apiUrl` en `environment.prod.ts` sea correcto
- Verificar CORS en el backend
- Verificar que el backend esté despierto (hacer un request a `/health`)

---

## Testing en Producción

1. **Backend:**
   ```bash
   curl https://TU-BACKEND.up.railway.app/health
   # Debería devolver: {"status":"ok","timestamp":"..."}
   ```

2. **Frontend:**
   - Abrir https://TU-APP.vercel.app
   - Debería cargar la pantalla de PIN

---

## Costos Estimados

**Railway (Backend + DB):**
- $5 gratis/mes
- Con optimizaciones: ~$2-3/mes de uso real
- Si te pasás: ~$0.01/hora adicional

**Vercel (Frontend):**
- 100% gratis para uso personal
- Bandwidth ilimitado

**Total:** ~$0-3/mes dependiendo del uso
