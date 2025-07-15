"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.failedAttempts = void 0;
exports.ipAttackGuard = ipAttackGuard;
exports.registerFailedAttempt = registerFailedAttempt;
exports.clearFailedAttempts = clearFailedAttempts;
const logger_1 = __importDefault(require("../logger/logger"));
// Estructura para guardar intentos fallidos por IP
exports.failedAttempts = {};
// Configuración de seguridad
const BLOCK_TIME = 2 * 60 * 1000; // 10 minutos
const MAX_ATTEMPTS = 3; // Intentos permitidos
// Middleware para bloquear IPs con muchos intentos fallidos
function ipAttackGuard(req, res, next) {
    var _a, _b, _c;
    const ip = (_c = (_a = req.ip) !== null && _a !== void 0 ? _a : (_b = req.socket) === null || _b === void 0 ? void 0 : _b.remoteAddress) !== null && _c !== void 0 ? _c : 'unknown';
    const now = Date.now();
    if (exports.failedAttempts[ip] && exports.failedAttempts[ip].count >= MAX_ATTEMPTS) {
        const timeSinceLast = now - exports.failedAttempts[ip].lastAttempt;
        if (timeSinceLast < BLOCK_TIME) {
            logger_1.default.warn(`IP bloqueada por actividad sospechosa: ${ip}`);
            return;
        }
        else {
            logger_1.default.info(`✅ IP desbloqueada después del tiempo de espera: ${ip}`);
            delete exports.failedAttempts[ip]; // Desbloqueo automático
        }
    }
    next(); // Si no está bloqueada, continúa a la siguiente función
}
// Registrar un intento fallido para una IP
function registerFailedAttempt(ip) {
    const now = Date.now();
    if (!exports.failedAttempts[ip]) {
        exports.failedAttempts[ip] = { count: 1, lastAttempt: now };
    }
    else {
        const timeSinceLast = now - exports.failedAttempts[ip].lastAttempt;
        if (timeSinceLast > BLOCK_TIME) {
            exports.failedAttempts[ip] = { count: 1, lastAttempt: now };
        }
        else {
            exports.failedAttempts[ip].count += 1;
            exports.failedAttempts[ip].lastAttempt = now;
        }
    }
    logger_1.default.info(`⚠️ Intento fallido registrado para IP: ${ip} (${exports.failedAttempts[ip].count}/${MAX_ATTEMPTS})`);
}
// Limpiar el registro de intentos fallidos para una IP (por ejemplo, después de login exitoso)
function clearFailedAttempts(ip) {
    if (exports.failedAttempts[ip]) {
        delete exports.failedAttempts[ip];
        logger_1.default.info(`✅ Intentos fallidos limpiados para IP: ${ip}`);
    }
}
