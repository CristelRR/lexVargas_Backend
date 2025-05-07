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
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
class ExpedienteNModel {
    getExpedientes() {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request().query('SELECT * FROM tblExpediente');
            return result.recordset;
        });
    }
    crearExpediente(expedienteData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('numeroExpediente', expedienteData.numeroExpediente)
                .input('estado', expedienteData.estado)
                .input('descripcion', expedienteData.descripcion)
                .input('nombreExpediente', expedienteData.nombreExpediente)
                .input('idClienteFK', expedienteData.idClienteFK)
                .input('idEmpleadoFK', expedienteData.idEmpleadoFK)
                .query(`
                 INSERT INTO tblExpediente (numeroExpediente , estado , descripcion , nombreExpediente , idClienteFK , idEmpleadoFK)  
                VALUES (@numeroExpediente, @estado, @descripcion, @nombreExpediente, @idClienteFK, @idEmpleadoFK)
            `);
            return result;
        });
    }
    updateExpediente(expedienteData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('idExpediente', expedienteData.idExpediente)
                .input('numeroExpediente', expedienteData.numeroExpediente)
                .input('estado', expedienteData.estado)
                .input('descripcion', expedienteData.descripcion)
                .input('nombreExpediente', expedienteData.nombreExpediente)
                .query(`
                UPDATE tblExpediente 
                SET 
                    numeroExpediente = @numeroExpediente,
                    estado = @estado,
                    descripcion = @descripcion,
                    nombreExpediente = @nombreExpediente
                WHERE idExpediente = @idExpediente
            `);
            return result;
        });
    }
    deleteExpediente(idExpediente) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('idExpediente', idExpediente)
                .query('DELETE FROM tblExpediente WHERE idExpediente = @idExpediente');
            return result;
        });
    }
    findById(idExpediente) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('idExpediente', idExpediente)
                .query(`
                SELECT 
                    E.idExpediente,
                    E.numeroExpediente,
                    E.estado,
                    E.descripcion,
                    E.nombreExpediente,
                    E.idClienteFK,
                    E.idEmpleadoFK,
                    C.nombreCliente,
                    C.aPCliente,
                    Em.nombreEmpleado,
                    Em.aPEmpleado
                FROM tblExpediente E
                JOIN tblCliente C ON E.idClienteFK = C.idCliente
                JOIN tblEmpleado Em ON E.idEmpleadoFK = Em.idEmpleado
                WHERE E.idExpediente = @idExpediente
            `);
            return result.recordset; // Devuelve el primer registro
        });
    }
    // INFORMACION GENERAL POR NUMERO DE EXPEDIENTE
    informacionGeneral(idExpediente) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('idExpediente', idExpediente)
                .query(`
                SELECT 
                    idExpediente,
                    numeroExpediente,
                    descripcion,
                    estado,
                    nombreExpediente,
                    fechaApertura, 
                    anioExpediente
                FROM tblExpediente
                WHERE idExpediente = @idExpediente
            `);
            return result.recordset[0];
        });
    }
    getPartesPorExpediente(idExpediente) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const pool = yield (0, db_1.connectDB)();
            const id = typeof idExpediente === 'string' ? parseInt(idExpediente) : idExpediente;
            const result = yield pool.request()
                .input('idExpediente', id)
                .query(`
            SELECT 
                'Demandante' AS tipoParte,
                PD.idParteDemandante AS idParte,
                PD.relacionCaso,
                PD.nombreCompleto,
                PD.identificacionOficial,
                PD.fechaNacimiento,
                PD.domicilio,
                PD.telefono,
                PD.correo,
                PD.representanteLegalNombre,
                PD.numeroLicencia,
                PD.representanteLegalTelefono,
                PD.representanteLegalCorreo
            FROM tblParteDemandante PD
            WHERE PD.idExpedienteFK = @idExpediente
            
            UNION ALL
            
            SELECT 
                'Demandado' AS tipoParte,
                PDM.idParteDemandada AS idParte,
                PDM.relacionCaso,
                PDM.nombreCompleto,
                PDM.identificacionOficial,
                PDM.fechaNacimiento,
                PDM.domicilio,
                PDM.telefono,
                PDM.correo,
                PDM.representanteLegalNombre,
                PDM.representanteLegalCedula AS numeroLicencia,
                PDM.representanteLegalTelefono,
                PDM.representanteLegalCorreo
            FROM tblParteDemandada PDM
            WHERE PDM.idExpedienteFK = @idExpediente
            
            UNION ALL
            
            SELECT 
                'Tercero' AS tipoParte,
                TR.idTerceroRelacionado AS idParte,
                TR.relacionCaso,
                TR.nombreCompleto,
                TR.identificacionOficial,
                TR.fechaNacimiento,
                TR.domicilio,
                TR.telefono,
                TR.correo,
                NULL AS representanteLegalNombre,
                NULL AS numeroLicencia,
                NULL AS representanteLegalTelefono,
                NULL AS representanteLegalCorreo
            FROM tblTercerosRelacionados TR
            WHERE TR.idExpedienteFK = @idExpediente
          `);
            const partes = (_a = result === null || result === void 0 ? void 0 : result.recordset) !== null && _a !== void 0 ? _a : []; // Defensa contra undefined/null
            return partes; // devolvemos sin filtrar aún
        });
    }
    agregarParteDemandante(parteData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('idExpedienteFK', parteData.idExpedienteFK)
                .input('nombreCompleto', parteData.nombreCompleto)
                .input('relacionCaso', parteData.relacionCaso || 'Principal')
                .input('identificacionOficial', parteData.identificacionOficial)
                .input('fechaNacimiento', parteData.fechaNacimiento)
                .input('domicilio', parteData.domicilio)
                .input('telefono', parteData.telefono)
                .input('correo', parteData.correo)
                .input('representanteLegalNombre', parteData.representanteLegalNombre)
                .input('numeroLicencia', parteData.numeroLicencia || '')
                .input('representanteLegalTelefono', parteData.representanteLegalTelefono)
                .input('representanteLegalCorreo', parteData.representanteLegalCorreo)
                .query(`
                INSERT INTO tblParteDemandante 
                (idExpedienteFK, nombreCompleto, relacionCaso, identificacionOficial, fechaNacimiento, 
                 domicilio, telefono, correo, representanteLegalNombre, numeroLicencia, 
                 representanteLegalTelefono, representanteLegalCorreo)
                VALUES 
                (@idExpedienteFK, @nombreCompleto, @relacionCaso, @identificacionOficial, @fechaNacimiento, 
                 @domicilio, @telefono, @correo, @representanteLegalNombre, @numeroLicencia, 
                 @representanteLegalTelefono, @representanteLegalCorreo);
                SELECT SCOPE_IDENTITY() AS id;
            `);
            return result.recordset[0];
        });
    }
    agregarParteDemandada(demandadoData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('idExpedienteFK', demandadoData.idExpedienteFK)
                .input('nombreCompleto', demandadoData.nombreCompleto)
                .input('relacionCaso', demandadoData.relacionCaso)
                .input('identificacionOficial', demandadoData.identificacionOficial)
                .input('fechaNacimiento', demandadoData.fechaNacimiento)
                .input('domicilio', demandadoData.domicilio)
                .input('telefono', demandadoData.telefono)
                .input('correo', demandadoData.correo)
                .input('representanteLegalNombre', demandadoData.representanteLegalNombre)
                .input('representanteLegalCedula', demandadoData.representanteLegalCedula)
                .input('representanteLegalTelefono', demandadoData.representanteLegalTelefono)
                .input('representanteLegalCorreo', demandadoData.representanteLegalCorreo)
                .query(`
                INSERT INTO tblParteDemandada 
                (idExpedienteFK, nombreCompleto, relacionCaso, identificacionOficial, fechaNacimiento, domicilio, telefono, correo, representanteLegalNombre, representanteLegalCedula, representanteLegalTelefono, representanteLegalCorreo)
                VALUES 
                (@idExpedienteFK, @nombreCompleto, @relacionCaso, @identificacionOficial, @fechaNacimiento, @domicilio, @telefono, @correo, @representanteLegalNombre, @representanteLegalCedula, @representanteLegalTelefono, @representanteLegalCorreo)
            `);
            return result;
        });
    }
    agregarTerceroRelacionado(terceroData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input('idExpedienteFK', terceroData.idExpedienteFK)
                .input('nombreCompleto', terceroData.nombreCompleto)
                .input('relacionCaso', terceroData.relacionCaso)
                .input('identificacionOficial', terceroData.identificacionOficial)
                .input('fechaNacimiento', terceroData.fechaNacimiento)
                .input('domicilio', terceroData.domicilio)
                .input('telefono', terceroData.telefono)
                .input('correo', terceroData.correo)
                .query(`
                INSERT INTO tblTercerosRelacionados 
                (idExpedienteFK, nombreCompleto, relacionCaso, identificacionOficial, fechaNacimiento, domicilio, telefono, correo)
                VALUES 
                (@idExpedienteFK, @nombreCompleto, @relacionCaso, @identificacionOficial, @fechaNacimiento, @domicilio, @telefono, @correo)
            `);
            return result;
        });
    }
}
const expedienteNModel = new ExpedienteNModel();
exports.default = expedienteNModel;
