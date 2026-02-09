import { Router } from 'express';
import { z } from 'zod';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { payments } from '../db/schema';
import { verifyPin } from '../middleware/pin-auth.middleware';

const router = Router();

const createPaymentSchema = z.object({
  fromPerson: z.string().min(1).max(50),
  toPerson: z.string().min(1).max(50),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/), // Decimal as string
  description: z.string().max(255).optional(),
});

// GET /api/payments - Listar pagos con filtros opcionales
router.get('/', verifyPin, async (req, res) => {
  try {
    const { month, year } = req.query;

    let query = db.select().from(payments);

    // Filtros opcionales por mes/año
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      
      const result = await query
        .where(and(gte(payments.createdAt, startDate), lte(payments.createdAt, endDate)))
        .orderBy(desc(payments.createdAt));
      
      return res.json(result);
    }

    const result = await query.orderBy(desc(payments.createdAt));
    res.json(result);
  } catch (error) {
    console.error('Error listando payments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/payments/:id - Obtener un pago por ID
router.get('/:id', verifyPin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error obteniendo payment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/payments - Registrar un pago/transferencia
router.post('/', verifyPin, async (req, res) => {
  try {
    const body = createPaymentSchema.parse(req.body);

    // Validación: no puede pagarse a sí mismo
    if (body.fromPerson === body.toPerson) {
      return res.status(400).json({ error: 'No puede registrar un pago a la misma persona' });
    }

    const newPayment = await db.insert(payments).values({
      fromPerson: body.fromPerson,
      toPerson: body.toPerson,
      amount: body.amount,
      description: body.description,
    }).returning();

    res.status(201).json(newPayment[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error creando payment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/payments/:id - Eliminar un pago
router.delete('/:id', verifyPin, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.select().from(payments).where(eq(payments.id, id)).limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    await db.delete(payments).where(eq(payments.id, id));

    res.json({ message: 'Pago eliminado' });
  } catch (error) {
    console.error('Error eliminando payment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
