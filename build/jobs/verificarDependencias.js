"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
// Ejecutar auditoría de seguridad
(0, child_process_1.exec)('npm run audit', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error en audit:\n${stderr}`);
    }
    else {
        console.log(`Resultado audit:\n${stdout}`);
    }
});
// Corregir vulnerabilidades automáticamente
(0, child_process_1.exec)('npm run audit-fix', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error en audit-fix:\n${stderr}`);
    }
    else {
        console.log(`Vulnerabilidades corregidas:\n${stdout}`);
    }
});
// Actualizar paquetes obsoletos
(0, child_process_1.exec)('npm run update', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error al actualizar:\n${stderr}`);
    }
    else {
        console.log(`Dependencias actualizadas:\n${stdout}`);
    }
});
