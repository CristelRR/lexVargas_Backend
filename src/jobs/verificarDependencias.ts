import { exec } from 'child_process';

// Ejecutar auditoría de seguridad
exec('npm run audit', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error en audit:\n${stderr}`);
  } else {
    console.log(`Resultado audit:\n${stdout}`);
  }
});

// Corregir vulnerabilidades automáticamente
exec('npm run audit-fix', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error en audit-fix:\n${stderr}`);
  } else {
    console.log(`Vulnerabilidades corregidas:\n${stdout}`);
  }
});

// Actualizar paquetes obsoletos
exec('npm run update', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error al actualizar:\n${stderr}`);
  } else {
    console.log(`Dependencias actualizadas:\n${stdout}`);
  }
});
