import { Router } from 'express';
import { calculateBalance } from '../services/balance.service';
import { verifyPin } from '../middleware/pin-auth.middleware';

const router = Router();

// GET /api/balance - Calcular balance (con filtros opcionales)
router.get('/', verifyPin, async (req, res) => {
  try {
    const { month, year } = req.query;

    const monthNum = month ? parseInt(month as string) : undefined;
    const yearNum = year ? parseInt(year as string) : undefined;

    const balance = await calculateBalance(monthNum, yearNum);

    res.json(balance);
  } catch (error) {
    console.error('Error calculando balance:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/balance/total - Balance total (sin filtros de mes)
router.get('/total', verifyPin, async (req, res) => {
  try {
    const balance = await calculateBalance();

    res.json(balance);
  } catch (error) {
    console.error('Error calculando balance total:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
