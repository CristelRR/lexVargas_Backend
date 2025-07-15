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
class CitaModel {
    getCitas() {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request().query('SELECT * FROM tblCita');
            return result.recordset;
        });
    }
    crearCita(citaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('motivo', citaData.motivo)
                .input('estado', citaData.estado)
                .input('idClienteFK', citaData.idClienteFK)
                .input('idAgendaFK', citaData.idAgendaFK)
                .query(`
                INSERT INTO tblCita (motivo, estado, idClienteFK, idAgendaFK) 
                VALUES (@motivo, @estado, @idClienteFK, @idAgendaFK)
            `);
            return result;
        });
    }
    updateCita(citaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    deleteCita(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('idCita', idCita)
                .query('DELETE FROM tblCita WHERE idCita = @idCita');
            return result;
        });
    }
    findById(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    getAbogadosPorServicio(idServicio) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('idServicio', idServicio)
                .query(`
                SELECT e.idEmpleado, e.nombreEmpleado, e.aPEmpleado, e.aMEmpleado
                FROM tblServicio s JOIN 
                     tblEspecialidad_Servicio es ON s.idServicio = es.idServicio JOIN 
                     tblEmpleado e ON es.idEspecialidad = e.idEspecialidadFK
                WHERE s.idServicio = @idServicio AND e.idRolFK = 2;  
            `);
            return result.recordset;
        });
    }
    getHorariosDisponiblesPorAbogado(idAbogado) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    crearCitaConTransaccion(citaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const transaction = pool.transaction(); // Crear la transacción
            try {
                yield transaction.begin(); // Iniciar la transacción
                // Crear un "request" desde la transacción
                const request = transaction.request();
                // 1. Crear la cita en tblCita con idServicioFK incluido
                const result = yield request
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
                yield request
                    .input('idAgenda', citaData.idAgendaFK)
                    .input('nuevoEstado', 'Programada')
                    .query(`
                    UPDATE tblAgenda 
                    SET estado = @nuevoEstado
                    WHERE idAgenda = @idAgenda
                `);
                // Confirmar la transacción si todo ha salido bien
                yield transaction.commit();
                return { message: 'Cita creada y agenda actualizada correctamente', idCita };
            }
            catch (error) {
                // Revertir la transacción si ocurre un error
                yield transaction.rollback();
                throw new Error('Error en la transacción: ' + error.message);
            }
        });
    }
    getCitasByCliente(idCliente) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    // Para enviar correo
    obtenerDatosCliente(idCliente) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    // Método para obtener las citas de un abogado específico
    getCitasByAbogado(idAbogado) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    // Método para obtener las citas de un abogado específico
    getCitasBySecretaria() {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    // Método para obtener las clientes que tienen cita programada de un abogado específico
    getClientesPorAbogado(idAbogado) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    // Método para obtener las clientes que tienen cita programada de un abogado específico
    getClientesPorSecretaria() {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    // Método para canelar cita
    cancelarCita(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const transaction = pool.transaction();
            try {
                yield transaction.begin();
                // 1. Crear un request para actualizar el estado de la cita a "cancelada" en tblCita
                const requestCita = transaction.request();
                yield requestCita
                    .input('idCita', idCita)
                    .query(`
                    UPDATE tblCita 
                    SET estado = 'cancelada' 
                    WHERE idCita = @idCita
                `);
                // 2. Crear un segundo request para actualizar el estado de la agenda a "disponible" en tblAgenda
                const requestAgenda = transaction.request();
                yield requestAgenda
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
                yield transaction.commit();
                return { message: 'Cita cancelada y agenda actualizada correctamente' };
            }
            catch (error) {
                yield transaction.rollback();
                logger_1.default.error('Error en la cancelación de la cita:', error);
                throw new Error('Error en la cancelación de la cita: ' + error.message);
            }
        });
    }
    // Método para completar cita
    completarCita(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            try {
                const result = yield pool.request()
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
            }
            catch (error) {
                logger_1.default.error('Error al actualizar la cita:', error);
                throw new Error('Error al actualizar el estado de la cita: ' + error.message);
            }
        });
    }
    // Método para obtener los servicios únicos asociados al cliente a través de sus citas
    getServiciosPorCitasDeCliente(idCliente) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    getAllCitas() {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request().query(`
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
        });
    }
    getFullCitaDetails(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
    //Método para consutar las citas que pertenecen a un expediente
    getCitasCompletadasByExpediente(idExpediente) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
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
        });
    }
}
const citaModel = new CitaModel();
exports.default = citaModel;
