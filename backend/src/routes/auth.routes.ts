import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { db } from '../db';
import { settings } from '../db/schema';

const router = Router();

const setupSchema = z.object({
  pin: z.string().min(4).max(6),
  person1Name: z.string().min(1).max(50).optional(),
  person2Name: z.string().min(1).max(50).optional(),
});

const verifySchema = z.object({
  pin: z.string().min(4).max(6),
});

// POST /api/auth/setup - Configurar PIN inicial
router.post('/setup', async (req, res) => {
  try {
    const body = setupSchema.parse(req.body);

    // Verificar si ya existe configuración
    const existingSettings = await db.select().from(settings).limit(1);

    if (existingSettings.length > 0) {
      return res.status(400).json({ error: 'La aplicación ya está configurada' });
    }

    // Hash del PIN
    const saltRounds = parseInt(process.env.PIN_SALT_ROUNDS || '10');
    const pinHash = await bcrypt.hash(body.pin, saltRounds);

    // Crear settings
    const newSettings = await db.insert(settings).values({
      pinHash,
      person1Name: body.person1Name || 'Persona 1',
      person2Name: body.person2Name || 'Persona 2',
      person1Percentage: 50,
    }).returning();

    res.status(201).json({
      message: 'Configuración inicial completada',
      settings: {
        person1Name: newSettings[0].person1Name,
        person2Name: newSettings[0].person2Name,
        person1Percentage: newSettings[0].person1Percentage,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error en setup:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/verify - Verificar PIN
router.post('/verify', async (req, res) => {
  try {
    const body = verifySchema.parse(req.body);

    const settingsData = await db.select().from(settings).limit(1);

    if (settingsData.length === 0) {
      return res.status(404).json({ error: 'Aplicación no configurada' });
    }

    const { pinHash } = settingsData[0];
    const isValid = await bcrypt.compare(body.pin, pinHash);

    if (!isValid) {
      return res.status(401).json({ error: 'PIN incorrecto' });
    }

    res.json({
      message: 'PIN válido',
      settings: {
        person1Name: settingsData[0].person1Name,
        person2Name: settingsData[0].person2Name,
        person1Percentage: settingsData[0].person1Percentage,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error en verify:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/status - Verificar si la app está configurada
router.get('/status', async (req, res) => {
  try {
    const settingsData = await db.select().from(settings).limit(1);
    
    res.json({
      configured: settingsData.length > 0,
    });
  } catch (error) {
    console.error('Error en status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
