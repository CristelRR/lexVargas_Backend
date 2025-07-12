import { connectDB } from "../config/db";
import logger from "../logger/logger";

class ClienteModel {
    async getClientes() {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM tblCliente');
        return result.recordset;
    }

    async getClienteById(idCliente: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCliente', idCliente)
            .query('SELECT * FROM tblCliente WHERE idCliente = @idCliente'); 
        return result.recordset; 
    }
    
     // Método para verificar si el correo ya está registrado
     async verificarCorreoExistente(correo: string) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('correo', correo)
            .query('SELECT * FROM tblCliente WHERE correo = @correo');
        return result.recordset.length > 0; // Si existen registros, significa que el correo ya está registrado
    }
    
    async crearCliente(clienteData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('nombreCliente', clienteData.nombreCliente)
            .input('aPCliente', clienteData.aPCliente)
            .input('aMCliente', clienteData.aMCliente)
            .input('direccion', clienteData.direccion)
            .input('correo', clienteData.correo)
            .input('telefono', clienteData.telefono)
            .input('pass', clienteData.pass)
            .input('idRolFK', clienteData.idRolFK)
            .query(`
                INSERT INTO tblCliente 
                (nombreCliente, aPCliente, aMCliente, direccion, correo, telefono, pass, idRolFK) 
                VALUES (@nombreCliente, @aPCliente, @aMCliente, @direccion, @correo, @telefono, @pass, @idRolFK)
            `);
        return result; 
    }

    async updateCliente(idCliente: number, clienteData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCliente', idCliente)                         // Identificador del cliente (no editable)
            .input('nombreCliente', clienteData.nombreCliente)     // Campo editable
            .input('aPCliente', clienteData.aPCliente)             // Campo editable
            .input('aMCliente', clienteData.aMCliente)             // Campo editable
            .input('direccion', clienteData.direccion)             // Campo editable
            .input('correo', clienteData.correo)                   // Campo editable
            .input('telefono', clienteData.telefono)               // Campo editable
            .query(`
                UPDATE tblCliente 
                SET 
                    nombreCliente = @nombreCliente,
                    aPCliente = @aPCliente,
                    aMCliente = @aMCliente,
                    direccion = @direccion,
                    correo = @correo,
                    telefono = @telefono
                WHERE idCliente = @idCliente
            `);
        return result; // Retorna el resultado de la consulta
    }
    

    async deleteCliente(idCliente: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCliente', idCliente)
            .query('DELETE FROM tblCliente WHERE idCliente = @idCliente');
        return result;
    }

    async findById(idCliente: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCliente', idCliente)
            .query('SELECT * FROM tblCliente WHERE idCliente = @idCliente');
        return result.recordset;
    }

    async getClienteByCorreo(correo: string) {
        const pool = await connectDB();
        const result = await pool.request()
          .input('correo', correo)
          .query('SELECT * FROM tblCliente WHERE correo = @correo');
        return result.recordset[0];
      }
      
}


const clienteModelo = new ClienteModel();
export default clienteModelo;
