import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { settings } from '../db/schema';

export const verifyPin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pin = req.headers['x-pin'] as string;

    if (!pin) {
      return res.status(401).json({ error: 'PIN requerido' });
    }

    // Obtener settings de la DB
    const settingsData = await db.select().from(settings).limit(1);

    if (settingsData.length === 0) {
      // No hay settings, significa que aún no se configuró el PIN
      return res.status(404).json({ error: 'Aplicación no configurada' });
    }

    const { pinHash } = settingsData[0];

    // Verificar PIN
    const isValid = await bcrypt.compare(pin, pinHash);

    if (!isValid) {
      return res.status(401).json({ error: 'PIN incorrecto' });
    }

    next();
  } catch (error) {
    console.error('Error en verificación de PIN:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
