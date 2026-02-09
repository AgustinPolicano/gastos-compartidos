# 💰 Gastos Compartidos

Aplicación web para gestionar gastos compartidos entre dos personas con splits configurables, cuotas de gastos, y estimaciones de gastos fijos mensuales.

## ✨ Features

### 🔐 Autenticación
- Sistema de PIN simple (setup inicial + login)
- Hash seguro con bcrypt

### 💸 Gestión de Gastos
- **Gastos regulares:** Registro de gastos con payer y división configurable
- **Gastos en cuotas:** Soporte para pagos en múltiples cuotas con tracking individual
- **Pagos entre personas:** Registro de transferencias para saldar deudas

### 📊 Dashboard
- **Balance real:** Cálculo preciso de quién debe a quién
- **Estimación mensual:** Proyección basada en gastos reales + gastos fijos + cuotas activas
- **Gastos fijos:** Templates de estimación (alquiler, servicios) que NO se registran como gastos reales
- **Cuotas activas:** Progress bars mostrando cuotas pagadas/pendientes

### ⚙️ Configuración
- **Nombres personalizados** para cada persona
- **Split configurable:** Slider 0-100% para ajustar división de gastos (default 50/50)
- **Cambio de PIN:** Actualizar PIN de seguridad

## 🏗️ Stack Técnico

### Frontend
- **Angular 19** (standalone components, signals)
- **Tailwind CSS** para styling
- **TypeScript** con strict mode

### Backend
- **Node.js + Express** con TypeScript
- **Drizzle ORM** para database management
- **PostgreSQL** (Railway) como base de datos
- **bcrypt** para hashing de PIN

### DevOps
- **Docker + Docker Compose** para containerización
- **Nginx** como web server para el frontend
- **Health checks** en todos los servicios

## 🚀 Quick Start

### Desarrollo Local (sin Docker)

```bash
# Clonar repo
git clone <repo-url>
cd gastos-compartidos

# Configurar backend
cd backend
cp .env.example .env
# Editar .env con tu DATABASE_URL de Railway
npm install
npm run db:generate  # Generar migrations
npm run db:migrate   # Ejecutar migrations
npm run dev          # Puerto 3000

# En otra terminal - configurar frontend
cd frontend
npm install
npm start            # Puerto 4200
```

Acceder a: http://localhost:4200

### Desarrollo con Docker

```bash
# Configurar variables de entorno
cp .env.example .env
# Editar .env (ver DEPLOYMENT.md para detalles)

# Deploy con script automatizado
./deploy.sh
```

Acceder a: http://localhost

## 📖 Documentación Completa

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de deployment (local y VPS)
  - Setup en VPS
  - Configuración de SSL
  - Nginx reverse proxy
  - Troubleshooting
  - Monitoreo y backups

## 🗂️ Estructura del Proyecto

```
gastos-compartidos/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts        # Drizzle schema (5 tablas)
│   │   │   └── index.ts         # DB connection
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── settings.routes.ts
│   │   │   ├── expenses.routes.ts
│   │   │   ├── installments.routes.ts
│   │   │   ├── payments.routes.ts
│   │   │   ├── balance.routes.ts
│   │   │   └── fixed-expenses.routes.ts
│   │   └── index.ts             # Express app
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   └── services/
│   │   │   │       ├── api.service.ts
│   │   │   │       └── auth.service.ts
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── expenses/
│   │   │   │   ├── installments/
│   │   │   │   ├── payments/
│   │   │   │   ├── fixed-expenses/
│   │   │   │   └── settings/
│   │   │   └── app.routes.ts
│   │   └── environments/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── deploy.sh                    # Script automatizado de deployment
├── .env.example
├── DEPLOYMENT.md
└── README.md
```

## 🗄️ Schema de Base de Datos

### `settings`
- Nombres de las dos personas
- Porcentaje de split (person1Percentage)
- PIN hash

### `expenses`
- Gastos regulares y gastos con cuotas
- Campos: description, amount, payer, date, category
- Cuotas: isInstallment, totalInstallments, installmentPayer

### `installment_payments`
- Tracking de cuotas individuales
- Cada registro = 1 cuota de un gasto
- isPaid, installmentNumber

### `payments`
- Transferencias entre personas para saldar deudas
- from, to, amount, date

### `fixed_expenses`
- **Templates de estimación** (NO gastos reales)
- Solo: description, amount, category
- Se usan en Dashboard para calcular "Estimación Mensual"

## 🎯 Conceptos Clave

### Balance Real vs Estimación Mensual

**Balance Real:**
```
Gastos de Persona1 - Gastos de Persona2 (según split %)
+ Cuotas pagadas
- Pagos/Transferencias realizados
= Quién debe a quién
```

**Estimación Mensual:**
```
Gastos reales del mes actual
+ Cuotas activas de este mes
+ Fixed expenses (estimaciones)
= Proyección de gasto mensual
```

### Fixed Expenses (Gastos Fijos)

Son **estimaciones/templates**, NO gastos reales:
- Se registran con descripción, monto y categoría
- NO tienen payer ni afectan el balance
- Se muestran en Dashboard dentro de "Estimación Mensual"
- Ejemplo: alquiler $50000, internet $15000, luz $8000

### Cuotas (Installments)

- Al crear gasto con cuotas: se crea 1 expense + N installment_payments
- Cada cuota se puede marcar como pagada individualmente
- Solo las cuotas PAGADAS afectan el balance
- Monto de cuota = total / totalInstallments

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev         # Dev mode con tsx watch
npm run build       # Build + migrations
npm run db:generate # Generar migrations
npm run db:migrate  # Aplicar migrations
npm run db:studio   # Drizzle Studio UI
```

### Frontend
```bash
npm start           # ng serve (dev)
npm run build       # Build producción
npm test            # Tests
```

### Docker
```bash
./deploy.sh                  # Deploy automatizado
docker-compose up -d         # Levantar servicios
docker-compose down          # Detener servicios
docker-compose logs -f       # Ver logs
docker-compose ps            # Estado de containers
docker-compose restart       # Reiniciar servicios
```

## 🌐 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| **Auth** |
| POST | `/api/auth/setup` | Setup inicial de PIN |
| POST | `/api/auth/verify` | Verificar PIN |
| **Settings** |
| GET | `/api/settings` | Obtener configuración |
| PUT | `/api/settings` | Actualizar nombres/split |
| PUT | `/api/settings/pin` | Cambiar PIN |
| **Expenses** |
| GET | `/api/expenses` | Listar gastos (con query filters) |
| POST | `/api/expenses` | Crear gasto |
| PUT | `/api/expenses/:id` | Actualizar gasto |
| DELETE | `/api/expenses/:id` | Eliminar gasto |
| **Installments** |
| GET | `/api/expenses/:id/installments` | Listar cuotas de un gasto |
| PUT | `/api/expenses/:expenseId/installments/:id` | Marcar cuota pagada/no pagada |
| **Payments** |
| GET | `/api/payments` | Listar pagos |
| POST | `/api/payments` | Registrar pago |
| DELETE | `/api/payments/:id` | Eliminar pago |
| **Balance** |
| GET | `/api/balance` | Calcular balance actual |
| **Fixed Expenses** |
| GET | `/api/fixed-expenses` | Listar gastos fijos (estimaciones) |
| POST | `/api/fixed-expenses` | Crear gasto fijo |
| PUT | `/api/fixed-expenses/:id` | Actualizar gasto fijo |
| DELETE | `/api/fixed-expenses/:id` | Eliminar gasto fijo |

## 🔐 Variables de Entorno

Ver `.env.example` para configuración completa.

**Mínimas requeridas:**

```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:port/db
PORT=3000
CORS_ORIGIN=http://localhost  # O tu dominio en producción

# Frontend (Docker build arg)
API_URL=http://localhost:3000  # O tu dominio en producción
```

## 📝 TODO / Future Enhancements

- [ ] Exportar reportes (CSV/PDF)
- [ ] Gráficos de gastos por categoría
- [ ] Notificaciones de deudas pendientes
- [ ] Multi-usuario (más de 2 personas)
- [ ] App móvil (React Native / Flutter)
- [ ] Soporte para múltiples monedas
- [ ] Recordatorios de pagos recurrentes

## 🤝 Contributing

Este es un proyecto personal, pero pull requests son bienvenidos.

## 📄 License

MIT

---

**Desarrollado con ❤️ usando Angular, Node.js y Docker**
