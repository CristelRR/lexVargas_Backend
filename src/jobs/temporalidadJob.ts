import cron from 'node-cron';
import { connectDB } from '../config/db';
import logger from '../logger/logger'; // Ruta ajustada a tu estructura

cron.schedule('09 19 * * *', async () => {

  const pool = await connectDB();
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // 1. Archivar usuarios antiguos
    await transaction.request().query(`
      INSERT INTO tblUsuarioHistorial (
        idUsuario, nombreUsuario, pass, idRolFK, idEmpleadoFK, idClienteFK, fechaCreacion
      )
      SELECT idUsuario, nombreUsuario, pass, idRolFK, idEmpleadoFK, idClienteFK, fechaCreacion
      FROM tblUsuario
      WHERE fechaCreacion IS NOT NULL AND fechaCreacion < DATEADD(YEAR, -5, GETDATE());
    `);

    // 2. Desactivar usuarios (evita duplicar "_inactivo")
    await transaction.request().query(`
      UPDATE tblUsuario
      SET pass = 'INACTIVO',
          nombreUsuario = 
            CASE 
              WHEN nombreUsuario NOT LIKE '%_inactivo' THEN nombreUsuario + '_inactivo'
              ELSE nombreUsuario
            END
      WHERE fechaCreacion IS NOT NULL AND fechaCreacion < DATEADD(YEAR, -5, GETDATE());
    `);

    // 3. Archivar datos de CLIENTES (solo si rol = 3 y aún no están en el historial)
    await transaction.request().query(`
      INSERT INTO tblClienteHistorial (
        idCliente, nombreCliente, aPCliente, aMCliente, direccion,
        correo, telefono, pass, idRolFK, fechaArchivado
      )
      SELECT c.idCliente, c.nombreCliente, c.aPCliente, c.aMCliente, c.direccion,
             c.correo, c.telefono, c.pass, c.idRolFK, GETDATE()
      FROM tblUsuario u
      INNER JOIN tblCliente c ON u.idClienteFK = c.idCliente
      WHERE u.fechaCreacion IS NOT NULL
        AND u.fechaCreacion < DATEADD(YEAR, -5, GETDATE())
        AND u.idRolFK = 3
        AND NOT EXISTS (
          SELECT 1 FROM tblClienteHistorial h
          WHERE h.idCliente = c.idCliente
        );
    `);

    // 4. Desactivar acceso de CLIENTES
    await transaction.request().query(`
      UPDATE c
      SET pass = 'INACTIVO',
          correo = 'inactivo+' + correo
      FROM tblCliente c
      INNER JOIN tblUsuario u ON u.idClienteFK = c.idCliente
      WHERE u.fechaCreacion IS NOT NULL
        AND u.fechaCreacion < DATEADD(YEAR, -5, GETDATE())
        AND u.idRolFK = 3;
    `);

    // 5. Archivar datos de EMPLEADOS (solo si rol = 1 o 2)
    await transaction.request().query(`
      INSERT INTO tblEmpleadoHistorial (
        idEmpleado, fechaIngreso, numeroLicencia, correo, nombreEmpleado,
        aPEmpleado, aMEmpleado, telefono, pass, idRolFK, idEspecialidadFK, fechaArchivado
      )
      SELECT e.idEmpleado, e.fechaIngreso, e.numeroLicencia, e.correo, e.nombreEmpleado,
             e.aPEmpleado, e.aMEmpleado, e.telefono, e.pass, e.idRolFK, e.idEspecialidadFK, GETDATE()
      FROM tblUsuario u
      INNER JOIN tblEmpleado e ON u.idEmpleadoFK = e.idEmpleado
      WHERE u.fechaCreacion IS NOT NULL
        AND u.fechaCreacion < DATEADD(YEAR, -5, GETDATE())
        AND u.idRolFK IN (1, 2)
        AND NOT EXISTS (
          SELECT 1 FROM tblEmpleadoHistorial h
          WHERE h.idEmpleado = e.idEmpleado
        );
    `);

    // 6. Desactivar acceso de EMPLEADOS
    await transaction.request().query(`
      UPDATE e
      SET pass = 'INACTIVO',
          correo = 'inactivo+' + correo
      FROM tblEmpleado e
      INNER JOIN tblUsuario u ON u.idEmpleadoFK = e.idEmpleado
      WHERE u.fechaCreacion IS NOT NULL
        AND u.fechaCreacion < DATEADD(YEAR, -5, GETDATE())
        AND u.idRolFK IN (1, 2);
    `);

    await transaction.commit();

  } catch (error) {
    await transaction.rollback();
    if (error instanceof Error) {
      logger.error('Error durante cronjob. Se revirtió la transacción:', error.message);
    } else {
      logger.error('Error desconocido durante cronjob. Se revirtió la transacción:', error);
    }
  }
});
