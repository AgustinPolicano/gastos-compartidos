import { Router } from 'express';
import { z } from 'zod';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from '../db';
import { expenses } from '../db/schema';
import { verifyPin } from '../middleware/pin-auth.middleware';

const router = Router();

const createExpenseSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/), // Decimal as string
  paidBy: z.string().min(1).max(50),
  category: z.string().max(50).optional(),
  splitType: z.enum(['default', 'custom', 'payer_only']).default('default'),
  customPercentage: z.number().min(0).max(100).optional(),
  isInstallment: z.boolean().default(false),
  totalInstallments: z.number().int().positive().optional(),
  installmentPayer: z.string().max(50).optional(),
});

const updateExpenseSchema = createExpenseSchema.partial();

// GET /api/expenses - Listar gastos con filtros opcionales
router.get('/', verifyPin, async (req, res) => {
  try {
    const { month, year, category } = req.query;

    let query = db.select().from(expenses);

    // Filtros opcionales
    const conditions = [];

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      conditions.push(gte(expenses.createdAt, startDate));
      conditions.push(lte(expenses.createdAt, endDate));
    }

    if (category) {
      conditions.push(eq(expenses.category, category as string));
    }

    const result = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(expenses.createdAt))
      : await query.orderBy(desc(expenses.createdAt));

    res.json(result);
  } catch (error) {
    console.error('Error listando expenses:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/expenses/:id - Obtener un gasto por ID
router.get('/:id', verifyPin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error obteniendo expense:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/expenses - Crear gasto
router.post('/', verifyPin, async (req, res) => {
  try {
    const body = createExpenseSchema.parse(req.body);

    // Validaciones adicionales
    if (body.splitType === 'custom' && !body.customPercentage) {
      return res.status(400).json({ error: 'customPercentage es requerido cuando splitType es custom' });
    }

    if (body.isInstallment && (!body.totalInstallments || !body.installmentPayer)) {
      return res.status(400).json({ error: 'totalInstallments y installmentPayer son requeridos para gastos en cuotas' });
    }

    const newExpense = await db.insert(expenses).values({
      description: body.description,
      amount: body.amount,
      paidBy: body.paidBy,
      category: body.category,
      splitType: body.splitType,
      customPercentage: body.customPercentage,
      isInstallment: body.isInstallment,
      totalInstallments: body.totalInstallments,
      installmentPayer: body.installmentPayer,
    }).returning();

    res.status(201).json(newExpense[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error creando expense:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/expenses/:id - Actualizar gasto
router.put('/:id', verifyPin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = updateExpenseSchema.parse(req.body);

    const existing = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    const updated = await db
      .update(expenses)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error actualizando expense:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/expenses/:id - Eliminar gasto
router.delete('/:id', verifyPin, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    await db.delete(expenses).where(eq(expenses.id, id));

    res.json({ message: 'Gasto eliminado' });
  } catch (error) {
    console.error('Error eliminando expense:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
