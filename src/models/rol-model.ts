import { connectDB } from "../config/db";
import logger from "../logger/logger";

class RolModel {
    async getRoles() {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM tblRol');
        return result.recordset;
    }

    async crearRol(rolData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('nombreRol', rolData.nombreRol)
            .query(`
                INSERT INTO tblRol (nombreRol) 
                VALUES (@nombreRol)
            `);
        return result;
    }

    async updateRol(rolData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idRol', rolData.idRol)
            .input('nombreRol', rolData.nombreRol)
            .query(`
                UPDATE tblRol 
                SET nombreRol = @nombreRol 
                WHERE idRol = @idRol
            `);
        return result;
    }

    async deleteRol(idRol: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idRol', idRol)
            .query('DELETE FROM tblRol WHERE idRol = @idRol');
        return result;
    }

    async findById(idRol: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idRol', idRol)
            .query('SELECT * FROM tblRol WHERE idRol = @idRol');
        return result.recordset;
    }
}

const rolModel = new RolModel();
export default rolModel;
