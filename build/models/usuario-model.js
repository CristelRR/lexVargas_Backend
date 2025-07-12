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
class UsuarioModel {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool
                .request()
                .input("email", email)
                .query("SELECT * FROM tblUsuario WHERE nombreUsuario = @email");
            return result.recordset[0];
        });
    }
    getUsuarios() {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request().query("SELECT * FROM tblUsuario");
            return result.recordset;
        });
    }
    crearUsuario(usuarioData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool
                .request()
                .input("nombreUsuario", usuarioData.nombreUsuario)
                .input("pass", usuarioData.pass)
                .input("estado", usuarioData.estado)
                .input("idRolFK", usuarioData.idRolFK).query(`
                INSERT INTO tblUsuario 
                (nombreUsuario, pass, estado, idRolFK) 
                VALUES (@nombreUsuario, @pass, @estado, @idRolFK)
            `);
            return result;
        });
    }
    updateUsuario(usuarioData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool
                .request()
                .input("idUsuario", usuarioData.idUsuario)
                .input("nombreUsuario", usuarioData.nombreUsuario)
                .input("pass", usuarioData.pass)
                .input("estado", usuarioData.estado)
                .input("idRolFK", usuarioData.idRolFK).query(`
                UPDATE tblUsuario 
                SET 
                    nombreUsuario = @nombreUsuario,
                    pass = @pass,
                    estado = @estado,
                    idRolFK = @idRolFK 
                WHERE idUsuario = @idUsuario
            `);
            return result;
        });
    }
    deleteUsuario(idUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool
                .request()
                .input("idUsuario", idUsuario)
                .query("DELETE FROM tblUsuario WHERE idUsuario = @idUsuario");
            return result;
        });
    }
    findById(idUsuario) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool
                .request()
                .input("idUsuario", idUsuario)
                .query("SELECT * FROM tblUsuario WHERE idUsuario = @idUsuario");
            return result.recordset;
        });
    }
    updateOTP(idUsuarioFK, otp, otpExpiration) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, db_1.connectDB)();
                // 🔍 Agregar log para ver si la función se ejecuta correctamente
                const result = yield pool
                    .request()
                    .input("idUsuarioFK", idUsuarioFK)
                    .input("otp", otp)
                    .input("otpExpiration", otpExpiration).query(`
                    IF EXISTS (SELECT 1 FROM tblUsuarioOTP WHERE idUsuarioFK = @idUsuarioFK)
                    BEGIN
                        UPDATE tblUsuarioOTP 
                        SET otp = @otp, otpExpiration = @otpExpiration 
                        WHERE idUsuarioFK = @idUsuarioFK
                    END
                    ELSE
                    BEGIN
                        INSERT INTO tblUsuarioOTP (idUsuarioFK, otp, otpExpiration)
                        VALUES (@idUsuarioFK, @otp, @otpExpiration)
                    END
                `);
            }
            catch (error) {
                console.error("Error al insertar OTP en la base de datos:", error);
            }
        });
    }
    deleteOTP(idUsuarioFK) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, db_1.connectDB)();
                yield pool
                    .request()
                    .input("idUsuarioFK", idUsuarioFK)
                    .query("DELETE FROM tblUsuarioOTP WHERE idUsuarioFK = @idUsuarioFK");
            }
            catch (error) {
                console.error("Error al eliminar OTP:", error);
            }
        });
    }
    guardarTokenRecuperacion(idUsuarioFK, token, expiration) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool
                .request()
                .input("idUsuarioFK", idUsuarioFK)
                .input("token", token)
                .input("expiration", expiration).query(`
            IF EXISTS (SELECT 1 FROM tblPasswordReset WHERE idUsuarioFK = @idUsuarioFK)
            BEGIN
              UPDATE tblPasswordReset
              SET token = @token, expiration = @expiration
              WHERE idUsuarioFK = @idUsuarioFK
            END
            ELSE
            BEGIN
              INSERT INTO tblPasswordReset (idUsuarioFK, token, expiration)
              VALUES (@idUsuarioFK, @token, @expiration)
            END
          `);
            return result;
        });
    }
    buscarToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input("token", token)
                .query(`SELECT * FROM tblPasswordReset WHERE token = @token`);
            return result.recordset[0];
        });
    }
    actualizarContrasena(idUsuario, nuevaContrasena) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input("idUsuario", idUsuario)
                .input("nuevaPass", nuevaContrasena) // La contraseña se guarda sin encriptación
                .query(`UPDATE tblUsuario SET pass = @nuevaPass WHERE idUsuario = @idUsuario`);
            return result;
        });
    }
    eliminarToken(idUsuarioFK) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = yield (0, db_1.connectDB)();
            const result = yield pool.request()
                .input("idUsuarioFK", idUsuarioFK)
                .query(`DELETE FROM tblPasswordReset WHERE idUsuarioFK = @idUsuarioFK`);
            return result;
        });
    }
}
const usuarioModel = new UsuarioModel();
exports.default = usuarioModel;
