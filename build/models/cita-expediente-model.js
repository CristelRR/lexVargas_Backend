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
const db_1 = require("../config/db");
const logger_1 = __importDefault(require("../logger/logger"));
class CitaExpedienteModel {
    getCitasExpediente(idExpediente) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            try {
                const result = yield pool.request()
                    .input('idExpediente', idExpediente)
                    .query(`
                    SELECT 
                        c.idCita,
                        c.fecha,
                        c.hora,
                        c.motivo,
                        c.notas,
                        c.estado AS estadoCita,
                        e.nombreExpediente,
                        CONCAT(cli.nombreCliente, ' ', cli.aPCliente, ' ', cli.aMCliente) AS nombreCliente,
                        s.nombreServicio
                    FROM LEXVARGAS_BD.dbo.tblCitasExpediente c
                    INNER JOIN LEXVARGAS_BD.dbo.tblExpediente e ON c.idExpediente = e.idExpediente
                    INNER JOIN LEXVARGAS_BD.dbo.tblCliente cli ON e.idClienteFK = cli.idCliente
                    LEFT JOIN LEXVARGAS_BD.dbo.tblCliente_Servicio cs ON cli.idCliente = cs.idCliente
                    LEFT JOIN LEXVARGAS_BD.dbo.tblServicio s ON cs.idServicio = s.idServicio
                    WHERE c.idExpediente = @idExpediente;
                `);
                return result.recordset;
            }
            catch (error) {
                logger_1.default.error("Error al obtener citas del expediente:", error);
                throw error;
            }
        });
    }
    getExpediente() {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            try {
                const result = yield pool.request().query(`
                SELECT idExpediente, nombreExpediente, numeroExpediente from tblExpediente
            `);
                return result.recordset;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error al obtener expediente: ${error.message}`);
                }
                throw new Error('Error al obtener expediente: Error desconocido');
            }
        });
    }
    crearCitaExpediente(citaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const { idExpediente, fecha, hora, motivo, notas, estado } = citaData;
            try {
                const result = yield pool.request()
                    .input('idExpediente', idExpediente)
                    .input('fecha', fecha)
                    .input('hora', hora)
                    .input('motivo', motivo || null)
                    .input('notas', notas || null)
                    .input('estado', estado)
                    .query(`
                    INSERT INTO LEXVARGAS_BD.dbo.tblCitasExpediente (idExpediente, fecha, hora, motivo, notas, estado)
                    VALUES (@idExpediente, @fecha, @hora, @motivo, @notas, @estado);
                `);
                // Confirmar si la inserción fue exitosa
                return result.rowsAffected[0] > 0; // Devuelve verdadero si la fila fue insertada
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error al crear cita: ${error.message}`);
                }
                throw new Error('Error al crear cita: Error desconocido');
            }
        });
    }
    updateCitaExpediente(citaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const { idCita, motivo, estado } = citaData;
            try {
                const result = yield pool.request()
                    .input('idCita', idCita)
                    .input('motivo', motivo)
                    .input('estado', estado)
                    .query(`
                    UPDATE LEXVARGAS_BD.dbo.tblCitasExpediente
                    SET motivo = @motivo, estado = @estado
                    WHERE idCita = @idCita;
                `);
                // Verificar si se ha actualizado alguna fila
                return result.rowsAffected[0] > 0; // Devuelve verdadero si la fila fue actualizada
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error al actualizar cita: ${error.message}`);
                }
                throw new Error('Error al actualizar cita: Error desconocido');
            }
        });
    }
    deleteCitaExpediente(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            try {
                const result = yield pool.request()
                    .input('idCita', idCita)
                    .query('DELETE FROM LEXVARGAS_BD.dbo.tblCitasExpediente WHERE idCita = @idCita;');
                // Verificar si se ha eliminado alguna fila
                return result.rowsAffected[0] > 0; // Devuelve verdadero si la fila fue eliminada
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error al eliminar cita: ${error.message}`);
                }
                throw new Error('Error al eliminar cita: Error desconocido');
            }
        });
    }
}
const citaExpedienteModel = new CitaExpedienteModel();
exports.default = citaExpedienteModel;
