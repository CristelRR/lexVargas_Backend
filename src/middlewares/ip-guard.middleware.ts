import { Request, Response, NextFunction } from 'express';

export const failedAttempts: Record<string, { count: number; lastAttempt: number }> = {};
const BLOCK_TIME = 10 * 60 * 1000; // 10 minutos
const MAX_ATTEMPTS = 10;

export function ipAttackGuard(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const now = Date.now();

    if (failedAttempts[ip] && failedAttempts[ip].count >= MAX_ATTEMPTS) {
        const timeSinceLast = now - failedAttempts[ip].lastAttempt;

        if (timeSinceLast < BLOCK_TIME) {
            console.warn(`IP bloqueada por actividad sospechosa: ${ip}`);
        } else {
            console.log(`IP desbloqueada después de tiempo de espera: ${ip}`);
            delete failedAttempts[ip]; // Desbloquear después del tiempo
        }
    }

    next();
}

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

    console.log(`Intento fallido registrado para IP: ${ip} (${failedAttempts[ip].count}/${MAX_ATTEMPTS})`);
}

export function clearFailedAttempts(ip: string): void {
    if (failedAttempts[ip]) {
        delete failedAttempts[ip];
        console.log(`Intentos fallidos limpiados para IP: ${ip}`);
    }
}
