"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failedAttempts = void 0;
exports.ipAttackGuard = ipAttackGuard;
exports.registerFailedAttempt = registerFailedAttempt;
exports.clearFailedAttempts = clearFailedAttempts;
exports.failedAttempts = {};
const BLOCK_TIME = 10 * 60 * 1000; // 10 minutos
const MAX_ATTEMPTS = 10;
function ipAttackGuard(req, res, next) {
    var _a, _b, _c;
    const ip = (_c = (_a = req.ip) !== null && _a !== void 0 ? _a : (_b = req.socket) === null || _b === void 0 ? void 0 : _b.remoteAddress) !== null && _c !== void 0 ? _c : 'unknown';
    const now = Date.now();
    if (exports.failedAttempts[ip] && exports.failedAttempts[ip].count >= MAX_ATTEMPTS) {
        const timeSinceLast = now - exports.failedAttempts[ip].lastAttempt;
        if (timeSinceLast < BLOCK_TIME) {
            console.warn(`IP bloqueada por actividad sospechosa: ${ip}`);
        }
        else {
            console.log(`IP desbloqueada después de tiempo de espera: ${ip}`);
            delete exports.failedAttempts[ip]; // Desbloquear después del tiempo
        }
    }
    next();
}
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
    console.log(`Intento fallido registrado para IP: ${ip} (${exports.failedAttempts[ip].count}/${MAX_ATTEMPTS})`);
}
function clearFailedAttempts(ip) {
    if (exports.failedAttempts[ip]) {
        delete exports.failedAttempts[ip];
        console.log(`Intentos fallidos limpiados para IP: ${ip}`);
    }
}
