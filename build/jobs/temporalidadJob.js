"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../config/db");
node_cron_1.default.schedule('09 19 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield (0, db_1.connectDB)();
    const transaction = pool.transaction();
    try {
        yield transaction.begin();
        // 1. Archivar usuarios antiguos
        yield transaction.request().query(`
      INSERT INTO tblUsuarioHistorial (
        idUsuario, nombreUsuario, pass, idRolFK, idEmpleadoFK, idClienteFK, fechaCreacion
      )
      SELECT idUsuario, nombreUsuario, pass, idRolFK, idEmpleadoFK, idClienteFK, fechaCreacion
      FROM tblUsuario
      WHERE fechaCreacion IS NOT NULL AND fechaCreacion < DATEADD(YEAR, -5, GETDATE());
    `);
        // 2. Desactivar usuarios (evita duplicar "_inactivo")
        yield transaction.request().query(`
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
        yield transaction.request().query(`
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
        yield transaction.request().query(`
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
        yield transaction.request().query(`
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
        yield transaction.request().query(`
      UPDATE e
      SET pass = 'INACTIVO',
          correo = 'inactivo+' + correo
      FROM tblEmpleado e
      INNER JOIN tblUsuario u ON u.idEmpleadoFK = e.idEmpleado
      WHERE u.fechaCreacion IS NOT NULL
        AND u.fechaCreacion < DATEADD(YEAR, -5, GETDATE())
        AND u.idRolFK IN (1, 2);
    `);
        yield transaction.commit();
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof Error) {
            console.error('Error durante cronjob. Se revirtió la transacción:', error.message);
        }
        else {
            console.error('Error desconocido durante cronjob. Se revirtió la transacción:', error);
        }
    }
}));
