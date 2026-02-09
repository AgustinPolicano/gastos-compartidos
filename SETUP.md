# 🚀 Setup - Gastos Compartidos

## Requisitos Previos

- Node.js 22+ y npm
- PostgreSQL en Railway (o cualquier otra instancia)

---

## 1. Instalar Dependencias

Desde la raíz del proyecto:

```bash
npm install
```

Esto instalará las dependencias de **ambos** proyectos (frontend + backend) gracias a los workspaces de npm.

---

## 2. Configurar Backend

### 2.1 Variables de Entorno

```bash
cd backend
cp .env.example .env
```

Editar `backend/.env` con tu connection string de Railway:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=3000
NODE_ENV=development
PIN_SALT_ROUNDS=10
```

### 2.2 Generar y Correr Migraciones

```bash
# Generar migraciones de Drizzle (solo la primera vez o si cambiás el schema)
npm run db:generate

# Ejecutar migraciones en la DB
npm run db:migrate
```

**Nota:** Si querés pushear directamente el schema sin generar archivos de migración:
```bash
npm run db:push -- --driver=pg
```

Esto creará las 4 tablas en tu base de datos:
- `settings` - Configuración (nombres, %, PIN)
- `expenses` - Gastos
- `installment_payments` - Registro de cuotas pagadas
- `payments` - Transferencias entre personas

---

## 3. Iniciar en Modo Desarrollo

Desde la **raíz** del proyecto:

```bash
npm run dev
```

Esto iniciará ambos servidores en paralelo:
- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:4200

---

## 4. Primer Uso

1. Abrí http://localhost:4200
2. Como es la primera vez, te va a mostrar el **setup inicial**
3. Configurá:
   - Nombres de las dos personas
   - PIN de acceso (4-6 dígitos)
4. Listo, ya podés empezar a usar la app

---

## Estructura de la DB

### Settings
- Nombres de las personas
- Porcentaje de división (default 50/50, configurable)
- PIN hasheado

### Expenses
- Gastos normales o en cuotas
- División: default, custom, o payer_only
- Si es en cuotas: total de cuotas + quién las paga

### Installment Payments
- Registro de cada cuota marcada como pagada
- Fecha de pago

### Payments
- Transferencias entre personas para saldar deudas
- "Vicky le pagó $500 a Agustín"

---

## Lógica de Balance

El balance se calcula así:

1. **Gastos normales:** Se dividen según el % configurado
2. **Gastos en cuotas:** Solo se cuentan las cuotas marcadas como pagadas
3. **Pagos entre personas:** Se restan del balance

**Ejemplo:**
- Agustín pagó $10.000 (60/40) → Vicky debe $4.000
- Vicky pagó $5.000 (60/40) → Agustín debe $3.000
- Vicky le transfirió $2.000 a Agustín
- **Balance final:** Vicky le debe $2.000 a Agustín ($4.000 - $3.000 + $2.000)

---

## Scripts Útiles

### Backend
```bash
cd backend
npm run dev           # Modo desarrollo con tsx watch
npm run build         # Compilar TypeScript
npm run db:generate   # Generar migraciones (usa generate:pg)
npm run db:migrate    # Ejecutar migraciones
npm run db:push       # Push directo del schema (usa push:pg --driver=pg)
npm run db:studio     # Abrir Drizzle Studio (GUI de la DB)
```

### Frontend
```bash
cd frontend
npm start             # Modo desarrollo (ng serve)
npm run build         # Build de producción
```

### Monorepo (desde raíz)
```bash
npm run dev           # Correr backend + frontend en paralelo
npm run build         # Build de ambos proyectos
npm run dev:backend   # Solo backend
npm run dev:frontend  # Solo frontend
```

---

## Troubleshooting

### Error: "DATABASE_URL no está definida"
- Verificá que creaste el archivo `.env` en `backend/`
- Verificá que la variable esté bien escrita

### Error: "Cannot find module..."
- Corré `npm install` desde la raíz

### El frontend no se conecta al backend
- Verificá que el backend esté corriendo en el puerto 3000
- Verificá que no haya CORS issues (el backend ya tiene CORS habilitado)

### Error: "PIN incorrecto" después de cambiar el PIN
- El PIN se guarda en `localStorage` del browser
- Si cambiaste el PIN en Settings, deberías poder usar el nuevo
- Si hay problemas, hacé logout y volvé a entrar con el nuevo PIN

---

## Endpoints de la API

### Auth
- `GET /api/auth/status` - Verificar si está configurado
- `POST /api/auth/setup` - Setup inicial (PIN + nombres)
- `POST /api/auth/verify` - Verificar PIN

### Settings
- `GET /api/settings` - Obtener configuración
- `PUT /api/settings` - Actualizar (nombres, %, PIN)

### Expenses
- `GET /api/expenses` - Listar (filtros: month, year, category)
- `POST /api/expenses` - Crear
- `PUT /api/expenses/:id` - Actualizar
- `DELETE /api/expenses/:id` - Eliminar

### Installments
- `GET /api/expenses/:id/installments` - Ver cuotas de un gasto
- `POST /api/expenses/:id/installments` - Marcar cuota pagada
- `DELETE /api/expenses/:id/installments/:num` - Desmarcar cuota

### Payments
- `GET /api/payments` - Listar transferencias
- `POST /api/payments` - Registrar transferencia
- `DELETE /api/payments/:id` - Eliminar

### Balance
- `GET /api/balance` - Balance (filtros: month, year)
- `GET /api/balance/total` - Balance total histórico

---

## Tech Stack

**Frontend:**
- Angular 19 (standalone, signals, nueva sintaxis de control flow)
- Tailwind CSS
- TypeScript

**Backend:**
- Node.js + Express
- TypeScript
- Drizzle ORM
- bcrypt (para hashear el PIN)
- Zod (validación)

**Database:**
- PostgreSQL

---

¡Listo! Ya tenés la app completa funcionando 🎉
