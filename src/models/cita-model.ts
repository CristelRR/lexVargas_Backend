import { connectDB } from "../config/db";
import logger from "../logger/logger";


class CitaModel {
    async getCitas() {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM tblCita');
        return result.recordset;
    }

    async crearCita(citaData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('motivo', citaData.motivo)
            .input('estado', citaData.estado)
            .input('idClienteFK', citaData.idClienteFK)
            .input('idAgendaFK', citaData.idAgendaFK)
            .query(`
                INSERT INTO tblCita (motivo, estado, idClienteFK, idAgendaFK) 
                VALUES (@motivo, @estado, @idClienteFK, @idAgendaFK)
            `);
        return result;
    }

    async updateCita(citaData: any) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCita', citaData.idCita)
            .input('motivo', citaData.motivo)
            .input('estado', citaData.estado)
            .query(`
                UPDATE tblCita 
                SET 
                    motivo = @motivo,
                    estado = @estado 
                WHERE idCita = @idCita
            `);
        return result;
    }

    async deleteCita(idCita: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCita', idCita)
            .query('DELETE FROM tblCita WHERE idCita = @idCita');
        return result;
    }

    async findById(idCita: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCita', idCita)
            .query(`
                SELECT 
                    C.idCita,
                    C.motivo,
                    C.estado,
                    C.idClienteFK,
                    C.idAgendaFK,
                    C.idServicioFK,
                    A.fecha AS fechaCita,
                    A.horaInicio AS horaCita,
                    E.nombreEmpleado AS abogadoNombre,
                    E.aPEmpleado AS abogadoApellidoPaterno,
                    E.aMEmpleado AS abogadoApellidoMaterno,
                    S.nombreServicio,
                    S.descripcion AS descripcionServicio,
                    S.costo AS costoServicio
                FROM 
                    tblCita C
                JOIN 
                    tblAgenda A ON C.idAgendaFK = A.idAgenda
                JOIN 
                    tblEmpleado E ON A.idEmpleadoFK = E.idEmpleado
                JOIN 
                    tblServicio S ON C.idServicioFK = S.idServicio
                WHERE 
                    C.idCita = @idCita
            `);
        return result.recordset[0]; // Devuelve el primer (y único) registro
    }
    

    async getAbogadosPorServicio(idServicio:number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idServicio', idServicio)
            .query(`
                SELECT e.idEmpleado, e.nombreEmpleado, e.aPEmpleado, e.aMEmpleado
                FROM tblServicio s JOIN 
                     tblEspecialidad_Servicio es ON s.idServicio = es.idServicio JOIN 
                     tblEmpleado e ON es.idEspecialidad = e.idEspecialidadFK
                WHERE s.idServicio = @idServicio AND e.idRolFK = 2;  
            `);
        return result.recordset; 
    }

    async getHorariosDisponiblesPorAbogado(idAbogado: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idAbogado', idAbogado)
            .query(`
                SELECT a.fecha, a.horaInicio, a.horaFinal, a.estado, a.idAgenda
                FROM tblAgenda a
                WHERE 
                    a.idEmpleadoFK = @idAbogado  -- Filtra por el ID del abogado
                    AND a.estado = 'Disponible'  -- Solo horarios disponibles
                    AND a.fecha >= CAST(GETDATE() AS DATE)  -- Solo fechas futuras
                    AND NOT EXISTS (
                        SELECT 1
                        FROM tblCita c
                        WHERE 
                            c.idAgendaFK = a.idAgenda
                            AND c.estado = 'programada'  -- Solo citas programadas
                    )
                ORDER BY 
                    a.fecha, a.horaInicio;
            `);
        return result.recordset;
    }

    async crearCitaConTransaccion(citaData: any) {
        const pool = await connectDB();
        const transaction = pool.transaction(); // Crear la transacción
    
        try {
            await transaction.begin(); // Iniciar la transacción
    
            // Crear un "request" desde la transacción
            const request = transaction.request();
    
            // 1. Crear la cita en tblCita con idServicioFK incluido
            const result = await request
                .input('motivo', citaData.motivo)
                .input('estado', citaData.estado)
                .input('idClienteFK', citaData.idClienteFK)
                .input('idAgendaFK', citaData.idAgendaFK)
                .input('idServicioFK', citaData.idServicioFK) // Nuevo parámetro
                .query(`
                    INSERT INTO tblCita (motivo, estado, idClienteFK, idAgendaFK, idServicioFK)
                    OUTPUT inserted.idCita
                    VALUES (@motivo, @estado, @idClienteFK, @idAgendaFK, @idServicioFK)
                `);
    
            // Obtén el ID de la cita recién creada
            const idCita = result.recordset[0].idCita;
    
            // 2. Actualizar el estado de la agenda en tblAgenda
            await request
                .input('idAgenda', citaData.idAgendaFK)
                .input('nuevoEstado', 'Programada') 
                .query(`
                    UPDATE tblAgenda 
                    SET estado = @nuevoEstado
                    WHERE idAgenda = @idAgenda
                `);
    
            // Confirmar la transacción si todo ha salido bien
            await transaction.commit();
            return { message: 'Cita creada y agenda actualizada correctamente', idCita };
        } catch (error: any) { 
            // Revertir la transacción si ocurre un error
            await transaction.rollback();
            throw new Error('Error en la transacción: ' + error.message);
        }
    }
      
    
    async getCitasByCliente(idCliente: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCliente', idCliente)
            .query(`
                SELECT 
                    C.idCita,
                    C.motivo,
                    C.estado AS estadoCita,
                    CL.nombreCliente,
                    CL.aPCliente,
                    CL.aMCliente,
                    A.fecha AS fechaCita,
                    A.horaInicio,
                    A.horaFinal,
                    E.nombreEmpleado AS abogadoNombre,
                    E.aPEmpleado AS abogadoApellidoPaterno,
                    E.aMEmpleado AS abogadoApellidoMaterno,
                    S.nombreServicio,
                    S.descripcion AS descripcionServicio,
                    S.costo AS costoServicio,
                    C.idServicioFK
                FROM 
                    tblCita C
                JOIN 
                    tblCliente CL ON C.idClienteFK = CL.idCliente
                JOIN 
                    tblAgenda A ON C.idAgendaFK = A.idAgenda
                JOIN 
                    tblEmpleado E ON A.idEmpleadoFK = E.idEmpleado
                JOIN 
                    tblServicio S ON C.idServicioFK = S.idServicio
                WHERE 
                    C.idClienteFK = @idCliente;
            `);
        return result.recordset;
    }

    // Para enviar correo
    async obtenerDatosCliente(idCliente: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCliente', idCliente)
            .query(`
                SELECT 
                    nombreCliente, 
                    correo AS emailCliente, 
                    aPCliente, 
                    aMCliente
                FROM 
                    tblCliente
                WHERE 
                    idCliente = @idCliente
            `);
        return result.recordset[0]; // Devuelve un solo registro
    }
    

    // Método para obtener las citas de un abogado específico
    async getCitasByAbogado(idAbogado: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idAbogado', idAbogado) // Usamos el idAbogado para el filtro
            .query(`
                SELECT 
                    C.idCita,
                    C.motivo,
                    C.estado AS estadoCita,
                    CL.nombreCliente,
                    CL.aPCliente,
                    CL.aMCliente,
                    A.fecha AS fechaCita,
                    A.horaInicio,
                    A.horaFinal,
                    E.nombreEmpleado AS abogadoNombre,
                    E.aPEmpleado AS abogadoApellidoPaterno,
                    E.aMEmpleado AS abogadoApellidoMaterno,
                    S.nombreServicio,
                    S.descripcion AS descripcionServicio,
                    S.costo AS costoServicio,
                    C.idServicioFK
                FROM 
                    tblCita C
                JOIN 
                    tblCliente CL ON C.idClienteFK = CL.idCliente
                JOIN 
                    tblAgenda A ON C.idAgendaFK = A.idAgenda
                JOIN 
                    tblEmpleado E ON A.idEmpleadoFK = E.idEmpleado
                JOIN 
                    tblServicio S ON C.idServicioFK = S.idServicio
                WHERE 
                    E.idEmpleado = @idAbogado;  -- Filtramos por el id del abogado
            `);

        return result.recordset;
    }

    // Método para obtener las citas de un abogado específico
    async getCitasBySecretaria() {
        const pool = await connectDB();
        const result = await pool.request()
            .query(`
                SELECT 
                    C.idCita,
                    C.motivo,
                    C.estado AS estadoCita,
                    CL.nombreCliente,
                    CL.aPCliente,
                    CL.aMCliente,
                    A.fecha AS fechaCita,
                    A.horaInicio,
                    A.horaFinal,
                    E.nombreEmpleado AS abogadoNombre,
                    E.aPEmpleado AS abogadoApellidoPaterno,
                    E.aMEmpleado AS abogadoApellidoMaterno,
                    S.nombreServicio,
                    S.descripcion AS descripcionServicio,
                    S.costo AS costoServicio,
                    C.idServicioFK
                FROM 
                    tblCita C
                JOIN 
                    tblCliente CL ON C.idClienteFK = CL.idCliente
                JOIN 
                    tblAgenda A ON C.idAgendaFK = A.idAgenda
                JOIN 
                    tblEmpleado E ON A.idEmpleadoFK = E.idEmpleado
                JOIN 
                    tblServicio S ON C.idServicioFK = S.idServicio
            `);
        return result.recordset;
    }

    // Método para obtener las clientes que tienen cita programada de un abogado específico
    async getClientesPorAbogado(idAbogado: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idAbogado', idAbogado)
            .query(`
                SELECT DISTINCT 
                    CL.nombreCliente, 
                    CL.aPCliente, 
                    CL.aMCliente
                FROM 
                    tblCita C
                JOIN 
                    tblCliente CL ON C.idClienteFK = CL.idCliente
                JOIN 
                    tblAgenda A ON C.idAgendaFK = A.idAgenda
                JOIN 
                    tblEmpleado E ON A.idEmpleadoFK = E.idEmpleado
                WHERE 
                    E.idEmpleado = @idAbogado 
                    AND C.estado = 'programada';
            `);
        return result.recordset;
    }

    // Método para obtener las clientes que tienen cita programada de un abogado específico
    async getClientesPorSecretaria() {
        const pool = await connectDB();
        const result = await pool.request()
            .query(`
                SELECT DISTINCT 
                    CL.nombreCliente, 
                    CL.aPCliente, 
                    CL.aMCliente,
					E.nombreEmpleado,
					E.aPEmpleado,
					E.aMEmpleado
                FROM 
                    tblCita C
                JOIN 
                    tblCliente CL ON C.idClienteFK = CL.idCliente
                JOIN 
                    tblAgenda A ON C.idAgendaFK = A.idAgenda
                JOIN 
                    tblEmpleado E ON A.idEmpleadoFK = E.idEmpleado
                WHERE 
                     C.estado = 'programada';
            `);
        return result.recordset;
    } 
    
    // Método para canelar cita
    async cancelarCita(idCita: number) {
        const pool = await connectDB();
        const transaction = pool.transaction();
    
        try {
            await transaction.begin();
    
            // 1. Crear un request para actualizar el estado de la cita a "cancelada" en tblCita
            const requestCita = transaction.request();
            await requestCita
                .input('idCita', idCita)
                .query(`
                    UPDATE tblCita 
                    SET estado = 'cancelada' 
                    WHERE idCita = @idCita
                `);
    
            // 2. Crear un segundo request para actualizar el estado de la agenda a "disponible" en tblAgenda
            const requestAgenda = transaction.request();
            await requestAgenda
                .input('idCita', idCita)
                .query(`
                    UPDATE tblAgenda
                    SET estado = 'Disponible'
                    WHERE idAgenda = (
                        SELECT idAgendaFK 
                        FROM tblCita 
                        WHERE idCita = @idCita
                    )
                `);
    
            await transaction.commit();
            return { message: 'Cita cancelada y agenda actualizada correctamente' };
        } catch (error:any) {
            await transaction.rollback();
            logger.error('Error en la cancelación de la cita:', error);
            throw new Error('Error en la cancelación de la cita: ' + error.message);
        }
    }

    // Método para completar cita
    async completarCita(idCita: number) {
        const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('idCita', idCita)
                .query(`
                    UPDATE tblCita
                    SET estado = 'completada'
                    WHERE idCita = @idCita
                `);
    
            if (result.rowsAffected[0] === 0) {
                throw new Error('No se encontró una cita con el ID proporcionado.');
            }
    
            return { message: 'Estado de la cita actualizado a completada' };
        } catch (error: any) {
            logger.error('Error al actualizar la cita:', error);
            throw new Error('Error al actualizar el estado de la cita: ' + error.message);
        }
    }
       
    
    // Método para obtener los servicios únicos asociados al cliente a través de sus citas
    async getServiciosPorCitasDeCliente(idCliente: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCliente', idCliente)
            .query(`
                SELECT DISTINCT 
                    S.idServicio,
                    S.nombreServicio
                FROM 
                    tblCita C
                JOIN 
                    tblCliente CL ON C.idClienteFK = CL.idCliente
                JOIN 
                    tblServicio S ON C.idServicioFK = S.idServicio
                WHERE 
                    CL.idCliente = @idCliente;
            `);
        return result.recordset;
    }

    async getAllCitas() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT 
                C.idCita,
                C.motivo,
                C.estado AS estadoCita,
                CL.nombreCliente,
                CL.aPCliente AS apellidoPaternoCliente,
                CL.aMCliente AS apellidoMaternoCliente,
                A.fecha AS fechaCita,
                A.horaInicio,
                A.horaFinal,
                E.nombreEmpleado AS abogadoNombre,
                E.aPEmpleado AS abogadoApellidoPaterno,
                E.aMEmpleado AS abogadoApellidoMaterno,
                S.nombreServicio,
                S.descripcion AS descripcionServicio,
                S.costo AS costoServicio,
	            C.idServicioFK
            FROM 
                tblCita C
            JOIN 
                tblCliente CL ON C.idClienteFK = CL.idCliente
            JOIN 
                tblAgenda A ON C.idAgendaFK = A.idAgenda
            JOIN 
                tblEmpleado E ON A.idEmpleadoFK = E.idEmpleado
            JOIN 
                tblServicio S ON C.idServicioFK = S.idServicio;
        `);
        return result.recordset;
    }

    async getFullCitaDetails(idCita: number) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idCita', idCita)
            .query(`
                SELECT 
                    C.idCita,
                    C.motivo,
                    C.estado AS estadoCita,
                    CL.nombreCliente,
                    CL.aPCliente,
                    CL.aMCliente,
                    A.fecha AS fechaCita,
                    A.horaInicio,
                    A.horaFinal,
                    E.nombreEmpleado AS abogadoNombre,
                    E.aPEmpleado AS abogadoApellidoPaterno,
                    E.aMEmpleado AS abogadoApellidoMaterno,
                    S.nombreServicio,
                    S.descripcion AS descripcionServicio,
                    S.costo AS costoServicio,
                    C.idServicioFK
                FROM 
                    tblCita C
                JOIN 
                    tblCliente CL ON C.idClienteFK = CL.idCliente
                JOIN 
                    tblAgenda A ON C.idAgendaFK = A.idAgenda
                JOIN 
                    tblEmpleado E ON A.idEmpleadoFK = E.idEmpleado
                JOIN 
                    tblServicio S ON C.idServicioFK = S.idServicio
                WHERE 
                    C.idCita = @idCita;
            `);
        return result.recordset[0]; // Devuelve el primer (y único) registro
    }  
    
    //Método para consutar las citas que pertenecen a un expediente
    async getCitasCompletadasByExpediente(idExpediente: string) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('idExpediente', idExpediente)
            .query(`
                SELECT 
                    c.idCita,
                    c.motivo,
                    c.estado AS estadoCita,
                    c.idAgendaFK,
                    c.idServicioFK,
                    e.idExpediente,
                    e.nombreExpediente,
                    cl.idCliente,
                    CONCAT(cl.nombreCliente, ' ', cl.aPCliente, ' ', cl.aMCliente) AS nombreCliente,
                    cl.direccion,
                    cl.telefono,
                    cl.correo
                FROM 
                    tblCita AS c
                INNER JOIN 
                    tblExpediente AS e ON c.idClienteFK = e.idClienteFK
                INNER JOIN 
                    tblCliente AS cl ON e.idClienteFK = cl.idCliente
                WHERE 
                    e.idExpediente = @idExpediente
                    AND c.estado = 'completada';
            `);
        return result.recordset;
    }   
}

const citaModel = new CitaModel();
export default citaModel;
