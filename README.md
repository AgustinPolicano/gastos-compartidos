# Gastos Compartidos

App para gestionar gastos compartidos entre dos personas con división configurable.

## Stack

- **Frontend:** Angular 19 + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript + Drizzle ORM
- **Database:** PostgreSQL (Railway)

## Features

- PIN compartido para acceso
- División configurable de gastos (50/50 por defecto, ajustable con slider)
- Gastos en cuotas con tracking mensual
- Registro de pagos/transferencias entre personas
- Balance automático: quién le debe a quién

## Setup

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cd backend
cp .env.example .env
# Editar .env con tu connection string de Railway
```

3. Correr migraciones:
```bash
cd backend
npm run db:migrate
```

4. Iniciar en modo desarrollo:
```bash
npm run dev
```

- Frontend: http://localhost:4200
- Backend: http://localhost:3000

## Estructura

```
gastos-compartidos/
├── frontend/          # Angular 19 app
├── backend/           # Node + Express API
└── package.json       # Monorepo scripts
```

## Modelo de Datos

- `settings` - Configuración (nombres, porcentajes, PIN)
- `expenses` - Gastos (normales y en cuotas)
- `installment_payments` - Registro de cuotas pagadas
- `payments` - Transferencias entre personas
