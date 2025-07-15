import { connectDB } from "../config/db";
import { Request, Response } from "express";
import logger from "../logger/logger";

class CitaExpedienteModel {
    async getCitasExpediente(idExpediente: number) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
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
        } catch (error) {
            logger.error("Error al obtener citas del expediente:", error);
            throw error;
        }
    }
    


    async getExpediente() {
        const pool = await connectDB();
        try {
            const result = await pool.request().query(`
                SELECT idExpediente, nombreExpediente, numeroExpediente from tblExpediente
            `);
            return result.recordset;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener expediente: ${error.message}`);
            }
            throw new Error('Error al obtener expediente: Error desconocido');
        }
    }

    async crearCitaExpediente(citaData: any) {
        const pool = await connectDB();
        const { idExpediente, fecha, hora, motivo, notas, estado } = citaData;

        try {
            const result = await pool.request()
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
            return result.rowsAffected[0] > 0;  // Devuelve verdadero si la fila fue insertada
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al crear cita: ${error.message}`);
            }
            throw new Error('Error al crear cita: Error desconocido');
        }
    }

    async updateCitaExpediente(citaData: any) {
        const pool = await connectDB();
        const { idCita, motivo, estado } = citaData;

        try {
            const result = await pool.request()
                .input('idCita', idCita)
                .input('motivo', motivo)
                .input('estado', estado)
                .query(`
                    UPDATE LEXVARGAS_BD.dbo.tblCitasExpediente
                    SET motivo = @motivo, estado = @estado
                    WHERE idCita = @idCita;
                `);

            // Verificar si se ha actualizado alguna fila
            return result.rowsAffected[0] > 0;  // Devuelve verdadero si la fila fue actualizada
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al actualizar cita: ${error.message}`);
            }
            throw new Error('Error al actualizar cita: Error desconocido');
        }
    }

    async deleteCitaExpediente(idCita: number) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idCita', idCita)
                .query('DELETE FROM LEXVARGAS_BD.dbo.tblCitasExpediente WHERE idCita = @idCita;');

            // Verificar si se ha eliminado alguna fila
            return result.rowsAffected[0] > 0;  // Devuelve verdadero si la fila fue eliminada
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al eliminar cita: ${error.message}`);
            }
            throw new Error('Error al eliminar cita: Error desconocido');
        }
    }
}

const citaExpedienteModel = new CitaExpedienteModel();
export default citaExpedienteModel;
