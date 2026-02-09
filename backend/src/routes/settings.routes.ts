import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { settings } from '../db/schema';
import { verifyPin } from '../middleware/pin-auth.middleware';

const router = Router();

const updateSettingsSchema = z.object({
  person1Name: z.string().min(1).max(50).optional(),
  person2Name: z.string().min(1).max(50).optional(),
  person1Percentage: z.number().min(0).max(100).optional(),
  newPin: z.string().min(4).max(6).optional(),
});

// GET /api/settings - Obtener configuración
router.get('/', verifyPin, async (req, res) => {
  try {
    const settingsData = await db.select().from(settings).limit(1);

    if (settingsData.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const { id, person1Name, person2Name, person1Percentage } = settingsData[0];

    res.json({
      id,
      person1Name,
      person2Name,
      person1Percentage,
      person2Percentage: 100 - person1Percentage,
    });
  } catch (error) {
    console.error('Error obteniendo settings:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/settings - Actualizar configuración
router.put('/', verifyPin, async (req, res) => {
  try {
    const body = updateSettingsSchema.parse(req.body);

    const settingsData = await db.select().from(settings).limit(1);

    if (settingsData.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const updateData: any = {};

    if (body.person1Name) updateData.person1Name = body.person1Name;
    if (body.person2Name) updateData.person2Name = body.person2Name;
    if (body.person1Percentage !== undefined) {
      if (body.person1Percentage < 0 || body.person1Percentage > 100) {
        return res.status(400).json({ error: 'El porcentaje debe estar entre 0 y 100' });
      }
      updateData.person1Percentage = body.person1Percentage;
    }
    if (body.newPin) {
      const saltRounds = parseInt(process.env.PIN_SALT_ROUNDS || '10');
      updateData.pinHash = await bcrypt.hash(body.newPin, saltRounds);
    }

    const updated = await db
      .update(settings)
      .set(updateData)
      .where(eq(settings.id, settingsData[0].id))
      .returning();

    res.json({
      message: 'Configuración actualizada',
      settings: {
        id: updated[0].id,
        person1Name: updated[0].person1Name,
        person2Name: updated[0].person2Name,
        person1Percentage: updated[0].person1Percentage,
        person2Percentage: 100 - updated[0].person1Percentage,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error actualizando settings:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
