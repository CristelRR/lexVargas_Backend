import { connectDB } from "../config/db";
import logger from "../logger/logger";

class EmpleadoModel {
    async getEmpleados() {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM tblEmpleado');
        return result.recordset;
    }

    async getAbogados() {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM tblEmpleado AS E WHERE E.idRolFK = 2');
        return result.recordset;
    }

    async getEmpleadoById(idEmpleado: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idEmpleado', idEmpleado)
            .query('SELECT * FROM tblEmpleado WHERE idEmpleado = @idEmpleado');
        return result.recordset[0]; // Retorna el primer registro encontrado
    }    

    async crearEmpleado(empleadoData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('fechaIngreso', empleadoData.fechaIngreso)
            .input('numeroLicencia', empleadoData.numeroLicencia)
            .input('correo', empleadoData.correo)
            .input('nombreEmpleado', empleadoData.nombreEmpleado)
            .input('aPEmpleado', empleadoData.aPEmpleado)
            .input('aMEmpleado', empleadoData.aMEmpleado)
            .input('telefono', empleadoData.telefono)
            .input('pass', empleadoData.pass)
            .input('idRolFK', empleadoData.idRolFK)
            .input('idEspecialidadFK', empleadoData.idEspecialidadFK)
            .query(`
                INSERT INTO tblEmpleado 
                (fechaIngreso, numeroLicencia, correo, nombreEmpleado, aPEmpleado, aMEmpleado, telefono, pass, idRolFK, idEspecialidadFK) 
                VALUES (@fechaIngreso, @numeroLicencia, @correo, @nombreEmpleado, @aPEmpleado, @aMEmpleado, @telefono, @pass, @idRolFK, @idEspecialidadFK)
            `);
        return result;
    }

    async updateEmpleado(idEmpleado: number, empleadoData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idEmpleado', idEmpleado)                      // Identificador del empleado
            .input('correo', empleadoData.correo)                 // Campo editable
            .input('telefono', empleadoData.telefono)             // Campo editable
            .input('idEspecialidadFK', empleadoData.idEspecialidadFK) // Campo editable
            .input('nombreEmpleado', empleadoData.nombreEmpleado) // Campo editable
            .input('aPEmpleado', empleadoData.aPEmpleado)         // Campo editable
            .input('aMEmpleado', empleadoData.aMEmpleado)         // Campo editable
            .query(`
                UPDATE tblEmpleado 
                SET 
                    correo = @correo,
                    telefono = @telefono,
                    idEspecialidadFK = @idEspecialidadFK,
                    nombreEmpleado = @nombreEmpleado,
                    aPEmpleado = @aPEmpleado,
                    aMEmpleado = @aMEmpleado
                WHERE idEmpleado = @idEmpleado
            `);
        return result;
    }
    

    async deleteEmpleado(idEmpleado: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idEmpleado', idEmpleado)
            .query('DELETE FROM tblEmpleado WHERE idEmpleado = @idEmpleado');
        return result;
    }

    async findById(idEmpleado: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idEmpleado', idEmpleado)
            .query('SELECT * FROM tblEmpleado WHERE idEmpleado = @idEmpleado');
        return result.recordset;
    }
}

const empleadoModelo = new EmpleadoModel();
export default empleadoModelo;
