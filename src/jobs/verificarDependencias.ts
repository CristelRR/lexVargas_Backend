import { exec } from 'child_process';
import logger from '../logger/logger'; // Ruta ajustada a tu estructura

// Ejecutar auditoría de seguridad
exec('npm run audit', (err, stdout, stderr) => {
  if (err) {
    logger.error(`Error en audit:\n${stderr}`);
  } else {
    logger.info(`Resultado audit:\n${stdout}`);
  }
});

// Corregir vulnerabilidades automáticamente
exec('npm run audit-fix', (err, stdout, stderr) => {
  if (err) {
    logger.error(`Error en audit-fix:\n${stderr}`);
  } else {
    logger.info(`Vulnerabilidades corregidas:\n${stdout}`);
  }
});

// Actualizar paquetes obsoletos
exec('npm run update', (err, stdout, stderr) => {
  if (err) {
    logger.error(`Error al actualizar:\n${stderr}`);
  } else {
    logger.info(`Dependencias actualizadas:\n${stdout}`);
  }
});
