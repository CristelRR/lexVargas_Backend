"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const logger_1 = __importDefault(require("../logger/logger")); // Ruta ajustada a tu estructura
// Ejecutar auditoría de seguridad
(0, child_process_1.exec)('npm run audit', (err, stdout, stderr) => {
    if (err) {
        logger_1.default.error(`Error en audit:\n${stderr}`);
    }
    else {
        logger_1.default.info(`Resultado audit:\n${stdout}`);
    }
});
// Corregir vulnerabilidades automáticamente
(0, child_process_1.exec)('npm run audit-fix', (err, stdout, stderr) => {
    if (err) {
        logger_1.default.error(`Error en audit-fix:\n${stderr}`);
    }
    else {
        logger_1.default.info(`Vulnerabilidades corregidas:\n${stdout}`);
    }
});
// Actualizar paquetes obsoletos
(0, child_process_1.exec)('npm run update', (err, stdout, stderr) => {
    if (err) {
        logger_1.default.error(`Error al actualizar:\n${stderr}`);
    }
    else {
        logger_1.default.info(`Dependencias actualizadas:\n${stdout}`);
    }
});
