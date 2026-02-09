import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { fixedExpenses } from '../db/schema';
import { verifyPin } from '../middleware/pin-auth.middleware';

const router = Router();

const fixedExpenseSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  category: z.string().max(50).optional(),
});

// GET /api/fixed-expenses - Listar gastos fijos (estimaciones)
router.get('/', verifyPin, async (req, res) => {
  try {
    const fixed = await db.select().from(fixedExpenses);
    res.json(fixed);
  } catch (error) {
    console.error('Error listando gastos fijos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/fixed-expenses/:id - Obtener un gasto fijo
router.get('/:id', verifyPin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.select().from(fixedExpenses).where(eq(fixedExpenses.id, id)).limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Gasto fijo no encontrado' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error obteniendo gasto fijo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/fixed-expenses - Crear gasto fijo (estimación)
router.post('/', verifyPin, async (req, res) => {
  try {
    const body = fixedExpenseSchema.parse(req.body);

    const newFixed = await db.insert(fixedExpenses).values({
      description: body.description,
      amount: body.amount,
      category: body.category,
    }).returning();

    res.status(201).json(newFixed[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error creando gasto fijo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/fixed-expenses/:id - Actualizar gasto fijo
router.put('/:id', verifyPin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = fixedExpenseSchema.partial().parse(req.body);

    const existing = await db.select().from(fixedExpenses).where(eq(fixedExpenses.id, id)).limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Gasto fijo no encontrado' });
    }

    const updated = await db
      .update(fixedExpenses)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(fixedExpenses.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error actualizando gasto fijo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/fixed-expenses/:id - Eliminar gasto fijo
router.delete('/:id', verifyPin, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.select().from(fixedExpenses).where(eq(fixedExpenses.id, id)).limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Gasto fijo no encontrado' });
    }

    await db.delete(fixedExpenses).where(eq(fixedExpenses.id, id));

    res.json({ message: 'Gasto fijo eliminado' });
  } catch (error) {
    console.error('Error eliminando gasto fijo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/fixed-expenses/total - Calcular total de gastos fijos
router.get('/total/sum', verifyPin, async (req, res) => {
  try {
    const fixed = await db.select().from(fixedExpenses);
    const total = fixed.reduce((sum, f) => sum + parseFloat(f.amount), 0);
    
    res.json({ total });
  } catch (error) {
    console.error('Error calculando total de gastos fijos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
