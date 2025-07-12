import { connectDB } from "../config/db";
import logger from "../logger/logger";


class NotaModel {
    /**
     * Obtener todas las notas
     */
    async getNotas() {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM tblNota');
        return result.recordset;
    }

    /**
 * Buscar notas por el ID de la cita
 */
    async findNotasByCitaId(idCita: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCita', idCita)
            .query('SELECT * FROM tblNota WHERE idCitaFK = @idCita');
        return result.recordset;
    }


    /**
     * Obtener notas por cita o expediente
     */
    async getNotasPorCitaOExpediente(idCita: number | null, idExpediente: number | null) {
        const pool = await connectDB();
        let query = 'SELECT * FROM tblNota WHERE ';
        let filters = '';
        const request = pool.request();

        if (idCita) {
            filters += 'idCitaFK = @idCita ';
            request.input('idCita', idCita);
        }

        if (idExpediente) {
            if (filters) filters += 'OR ';
            filters += 'idExpedienteFK = @idExpediente ';
            request.input('idExpediente', idExpediente);
        }

        if (!filters) {
            throw new Error('Debe proporcionar al menos un ID de cita o expediente');
        }

        const result = await request.query(query + filters);
        return result.recordset;
    }

    /**
     * Crear una nueva nota
     */
    async crearNota(notaData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('titulo', notaData.titulo)
            .input('descripcion', notaData.descripcion)
            .input('tipoNota', notaData.tipoNota)
            .input('idCitaFK', notaData.idCitaFK || null)
            .input('idExpedienteFK', notaData.idExpedienteFK || null)
            .query(`
                INSERT INTO tblNota (titulo, descripcion, tipoNota, idCitaFK, idExpedienteFK, fechaCreacion) 
                VALUES (@titulo, @descripcion, @tipoNota, @idCitaFK, @idExpedienteFK, GETDATE())
            `);
        return result;
    }

    /**
     * Actualizar una nota existente
     */
    async updateNota(notaData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idNota', notaData.idNota)
            .input('titulo', notaData.titulo)
            .input('descripcion', notaData.descripcion)
            .input('tipoNota', notaData.tipoNota)
            .input('estado', notaData.estado || 'activa')
            .query(`
                UPDATE tblNota 
                SET titulo = @titulo, 
                    descripcion = @descripcion, 
                    tipoNota = @tipoNota, 
                    estado = @estado, 
                    ultimaActualizacion = GETDATE() 
                WHERE idNota = @idNota
            `);
        return result;
    }

    /**
     * Eliminar una nota
     */
    async deleteNota(idNota: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idNota', idNota)
            .query('DELETE FROM tblNota WHERE idNota = @idNota');
        return result;
    }

    /**
     * Buscar una nota por su ID
     */
    async findById(idNota: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idNota', idNota)
            .query('SELECT * FROM tblNota WHERE idNota = @idNota');
        return result.recordset;
    }
}

const notaModel = new NotaModel();
export default notaModel;
