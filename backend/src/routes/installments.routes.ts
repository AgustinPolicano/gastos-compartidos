import { Router } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { expenses, installmentPayments } from '../db/schema';
import { verifyPin } from '../middleware/pin-auth.middleware';

const router = Router();

const payInstallmentSchema = z.object({
  installmentNumber: z.number().int().positive(),
});

// GET /api/expenses/:expenseId/installments - Obtener cuotas de un gasto
router.get('/:expenseId/installments', verifyPin, async (req, res) => {
  try {
    const { expenseId } = req.params;

    // Verificar que el gasto existe y es en cuotas
    const expense = await db.select().from(expenses).where(eq(expenses.id, expenseId)).limit(1);

    if (expense.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    if (!expense[0].isInstallment) {
      return res.status(400).json({ error: 'Este gasto no es en cuotas' });
    }

    // Obtener todas las cuotas pagadas
    const paidInstallments = await db
      .select()
      .from(installmentPayments)
      .where(eq(installmentPayments.expenseId, expenseId));

    res.json({
      expense: expense[0],
      paidInstallments,
      totalInstallments: expense[0].totalInstallments,
      paidCount: paidInstallments.length,
      remainingCount: (expense[0].totalInstallments || 0) - paidInstallments.length,
    });
  } catch (error) {
    console.error('Error obteniendo installments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/expenses/:expenseId/installments - Marcar cuota como pagada
router.post('/:expenseId/installments', verifyPin, async (req, res) => {
  try {
    const { expenseId } = req.params;
    const body = payInstallmentSchema.parse(req.body);

    // Verificar que el gasto existe y es en cuotas
    const expense = await db.select().from(expenses).where(eq(expenses.id, expenseId)).limit(1);

    if (expense.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    if (!expense[0].isInstallment) {
      return res.status(400).json({ error: 'Este gasto no es en cuotas' });
    }

    // Verificar que el número de cuota es válido
    if (body.installmentNumber < 1 || body.installmentNumber > (expense[0].totalInstallments || 0)) {
      return res.status(400).json({ error: 'Número de cuota inválido' });
    }

    // Verificar que la cuota no está ya pagada
    const existing = await db
      .select()
      .from(installmentPayments)
      .where(
        and(
          eq(installmentPayments.expenseId, expenseId),
          eq(installmentPayments.installmentNumber, body.installmentNumber)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Esta cuota ya fue marcada como pagada' });
    }

    // Crear el registro de pago de cuota
    const newPayment = await db.insert(installmentPayments).values({
      expenseId,
      installmentNumber: body.installmentNumber,
    }).returning();

    res.status(201).json(newPayment[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error marcando installment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/expenses/:expenseId/installments/:installmentNumber - Desmarcar cuota
router.delete('/:expenseId/installments/:installmentNumber', verifyPin, async (req, res) => {
  try {
    const { expenseId, installmentNumber } = req.params;

    const existing = await db
      .select()
      .from(installmentPayments)
      .where(
        and(
          eq(installmentPayments.expenseId, expenseId),
          eq(installmentPayments.installmentNumber, parseInt(installmentNumber))
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada o no marcada como pagada' });
    }

    await db.delete(installmentPayments).where(eq(installmentPayments.id, existing[0].id));

    res.json({ message: 'Cuota desmarcada' });
  } catch (error) {
    console.error('Error desmarcando installment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
