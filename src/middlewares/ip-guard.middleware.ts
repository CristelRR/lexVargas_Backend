import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';

// Estructura para guardar intentos fallidos por IP
export const failedAttempts: Record<string, { count: number; lastAttempt: number }> = {};

// Configuración de seguridad
const BLOCK_TIME = 2 * 60 * 1000; // 10 minutos
const MAX_ATTEMPTS = 3;            // Intentos permitidos

// Middleware para bloquear IPs con muchos intentos fallidos
export function ipAttackGuard(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  const now = Date.now();

  if (failedAttempts[ip] && failedAttempts[ip].count >= MAX_ATTEMPTS) {
    const timeSinceLast = now - failedAttempts[ip].lastAttempt;

    if (timeSinceLast < BLOCK_TIME) {
      logger.warn(`IP bloqueada por actividad sospechosa: ${ip}`);
      return; 
    } else {
      logger.info(`✅ IP desbloqueada después del tiempo de espera: ${ip}`);
      delete failedAttempts[ip]; // Desbloqueo automático
    }
  }

  next(); // Si no está bloqueada, continúa a la siguiente función
}

// Registrar un intento fallido para una IP
export function registerFailedAttempt(ip: string): void {
  const now = Date.now();

  if (!failedAttempts[ip]) {
    failedAttempts[ip] = { count: 1, lastAttempt: now };
  } else {
    const timeSinceLast = now - failedAttempts[ip].lastAttempt;

    if (timeSinceLast > BLOCK_TIME) {
      failedAttempts[ip] = { count: 1, lastAttempt: now };
    } else {
      failedAttempts[ip].count += 1;
      failedAttempts[ip].lastAttempt = now;
    }
  }

  logger.info(`⚠️ Intento fallido registrado para IP: ${ip} (${failedAttempts[ip].count}/${MAX_ATTEMPTS})`);
}

// Limpiar el registro de intentos fallidos para una IP (por ejemplo, después de login exitoso)
export function clearFailedAttempts(ip: string): void {
  if (failedAttempts[ip]) {
    delete failedAttempts[ip];
    logger.info(`✅ Intentos fallidos limpiados para IP: ${ip}`);
  }
}
