import { connectDB } from "../config/db";
import logger from "../logger/logger";

class EspecialidadModel {
    async getEspecialidades() {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM tblEspecialidad');
        return result.recordset;
    }

    async crearEspecialidad(especialidadData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('nombreEspecialidad', especialidadData.nombreEspecialidad)
            .query(`
                INSERT INTO tblEspecialidad (nombreEspecialidad) 
                VALUES (@nombreEspecialidad)
            `);
        return result;
    }

    async updateEspecialidad(especialidadData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idEspecialidad', especialidadData.idEspecialidad)
            .input('nombreEspecialidad', especialidadData.nombreEspecialidad)
            .query(`
                UPDATE tblEspecialidad 
                SET nombreEspecialidad = @nombreEspecialidad 
                WHERE idEspecialidad = @idEspecialidad
            `);
        return result;
    }

    async deleteEspecialidad(idEspecialidad: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idEspecialidad', idEspecialidad)
            .query('DELETE FROM tblEspecialidad WHERE idEspecialidad = @idEspecialidad');
        return result;
    }

    async findById(idEspecialidad: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idEspecialidad', idEspecialidad)
            .query('SELECT * FROM tblEspecialidad WHERE idEspecialidad = @idEspecialidad');
        return result.recordset;
    }

    
}

const especialidadModel = new EspecialidadModel();
export default especialidadModel;
