import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';

// Routes
import authRoutes from './routes/auth.routes';
import settingsRoutes from './routes/settings.routes';
import expensesRoutes from './routes/expenses.routes';
import installmentsRoutes from './routes/installments.routes';
import paymentsRoutes from './routes/payments.routes';
import balanceRoutes from './routes/balance.routes';
import fixedExpensesRoutes from './routes/fixed-expenses.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/expenses', installmentsRoutes); // /:expenseId/installments
app.use('/api/payments', paymentsRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/fixed-expenses', fixedExpensesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
