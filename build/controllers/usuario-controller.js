"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.usuarioController = void 0;
const usuario_model_1 = __importDefault(require("../models/usuario-model"));
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const mailer_1 = require("../config/mailer");
const db_1 = require("../config/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UsuarioController {
    getUsuarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarios = yield usuario_model_1.default.getUsuarios();
                res.json(usuarios);
            }
            catch (error) {
                console.error("Error al obtener usuarios:", error);
                res.status(500).json({ message: "Error al obtener usuarios" });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, recaptcha } = req.body;
                const usuario = yield usuario_model_1.default.findByEmail(email);
                if (!usuario) {
                    return res.status(401).json({ message: "Credenciales incorrectas" });
                }
                const passwordValido = yield bcryptjs_1.default.compare(password, usuario.pass);
                if (!passwordValido) {
                    return res.status(401).json({ message: "Credenciales incorrectas" });
                }
                const secretKey = "6LemDAArAAAAANKFrntBm5gGMtjLGGB9X23Ml-RC";
                const recaptchaResponse = yield axios_1.default.post("https://www.google.com/recaptcha/api/siteverify", null, { params: { secret: secretKey, response: recaptcha } });
                if (!recaptchaResponse.data.success) {
                    return res.status(400).json({ message: "reCAPTCHA inválido" });
                }
                const otp = crypto.randomInt(100000, 999999).toString();
                const otpExpiration = Date.now() + 5 * 60 * 1000;
                yield usuario_model_1.default.updateOTP(usuario.idUsuario, otp, otpExpiration);
                yield (0, mailer_1.enviarCorreo)(usuario.nombreUsuario, "Código de verificación OTP", `<p>Tu código de verificación es: <strong>${otp}</strong></p>`);
                return res.json({
                    message: "OTP enviado",
                    email: usuario.nombreUsuario,
                });
            }
            catch (error) {
                console.error("Error en el login:", error);
                res.status(500).json({ message: "Error al iniciar sesión" });
            }
        });
    }
    verificarOTP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const usuario = yield usuario_model_1.default.findByEmail(email);
                if (!usuario) {
                    return res.status(400).json({ message: "Usuario no encontrado" });
                }
                const pool = yield (0, db_1.connectDB)();
                const result = yield pool
                    .request()
                    .input("idUsuarioFK", usuario.idUsuario)
                    .query("SELECT otp, otpExpiration FROM tblUsuarioOTP WHERE idUsuarioFK = @idUsuarioFK");
                if (result.recordset.length === 0) {
                    return res.status(400).json({ message: "OTP no encontrado" });
                }
                const usuarioOTP = result.recordset[0];
                if (usuarioOTP.otp !== otp) {
                    return res.status(400).json({ message: "Código OTP incorrecto" });
                }
                if (Date.now() > usuarioOTP.otpExpiration) {
                    return res.status(400).json({ message: "Código OTP expirado" });
                }
                yield usuario_model_1.default.deleteOTP(usuario.idUsuario);
                const token = jsonwebtoken_1.default.sign({
                    id: usuario.idUsuario,
                    rol: usuario.idRolFK,
                    idEmpleado: usuario.idEmpleadoFK,
                    idCliente: usuario.idClienteFK,
                }, "CLAVE_SECRETA_SUPERSEGURA", { expiresIn: "30m" });
                res.json({
                    message: "OTP verificado correctamente",
                    token,
                    usuario: {
                        id: usuario.idUsuario,
                        nombre: usuario.nombreUsuario,
                        rol: usuario.idRolFK,
                        idEmpleado: usuario.idEmpleadoFK,
                        idCliente: usuario.idClienteFK,
                    },
                });
            }
            catch (error) {
                console.error("Error al verificar OTP:", error);
                res.status(500).json({ message: "Error al verificar OTP" });
            }
        });
    }
    crearUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarioData = req.body;
                const hashedPassword = yield bcryptjs_1.default.hash(usuarioData.pass, 10);
                usuarioData.pass = hashedPassword;
                yield usuario_model_1.default.crearUsuario(usuarioData);
                res.status(201).json({ message: "Usuario creado exitosamente" });
            }
            catch (error) {
                console.error("Error al crear usuario:", error);
                res.status(500).json({ message: "Error al crear usuario" });
            }
        });
    }
    updateUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarioData = req.body;
                yield usuario_model_1.default.updateUsuario(usuarioData);
                res.json({ message: "Usuario actualizado exitosamente" });
            }
            catch (error) {
                console.error("Error al actualizar usuario:", error);
                res.status(500).json({ message: "Error al actualizar usuario" });
            }
        });
    }
    deleteUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idUsuario } = req.body;
                yield usuario_model_1.default.deleteUsuario(idUsuario);
                res.json({ message: "Usuario eliminado exitosamente" });
            }
            catch (error) {
                console.error("Error al eliminar usuario:", error);
                res.status(500).json({ message: "Error al eliminar usuario" });
            }
        });
    }
    enviarCorreoRecuperacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const usuario = yield usuario_model_1.default.findByEmail(email);
                if (!usuario) {
                    return res.status(404).json({ message: "Usuario no encontrado" });
                }
                const token = crypto.randomBytes(32).toString("hex");
                const expiration = Date.now() + 15 * 60 * 1000;
                yield usuario_model_1.default.guardarTokenRecuperacion(usuario.idUsuario, token, expiration);
                const link = `https://lexvargas-bufet.web.app/restablecer-contrasena/${token}`;
                yield (0, mailer_1.enviarCorreo)(email, "Recuperación de Contraseña", `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
         <a href="${link}">${link}</a>
         <p>Este enlace expirará en 15 minutos.</p>`);
                res.json({ message: "Correo enviado correctamente" });
            }
            catch (error) {
                console.error("Error al enviar correo de recuperación:", error);
                res.status(500).json({ message: "Error interno" });
            }
        });
    }
    restablecerContrasena(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { token, nuevaContrasena } = req.body;
                const registro = yield usuario_model_1.default.buscarToken(token);
                if (!registro) {
                    return res.status(400).json({ message: "Token inválido" });
                }
                if (Date.now() > registro.expiration) {
                    return res.status(400).json({ message: "Token expirado" });
                }
                const hashedPassword = yield bcryptjs_1.default.hash(nuevaContrasena, 10);
                yield usuario_model_1.default.actualizarContrasena(registro.idUsuarioFK, hashedPassword);
                yield usuario_model_1.default.eliminarToken(registro.idUsuarioFK);
                const usuario = yield usuario_model_1.default.findById(registro.idUsuarioFK);
                const correoUsuario = (_a = usuario[0]) === null || _a === void 0 ? void 0 : _a.nombreUsuario;
                if (correoUsuario) {
                    yield (0, mailer_1.enviarCorreo)(correoUsuario, "Confirmación de cambio de contraseña", `<p>Hola,</p>
           <p>Tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, por favor contáctanos inmediatamente.</p>`);
                }
                res.json({ message: "Contraseña restablecida correctamente" });
            }
            catch (error) {
                console.error("Error al restablecer contraseña:", error);
                res.status(500).json({ message: "Error interno al restablecer contraseña" });
            }
        });
    }
    extenderSesion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!token) {
                    return res.status(400).json({ message: "Token no proporcionado" });
                }
                const decoded = jsonwebtoken_1.default.verify(token, 'CLAVE_SECRETA_SUPERSEGURA');
                if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
                    const nuevaExpiracion = Date.now() + 30 * 60 * 1000;
                    const newToken = jsonwebtoken_1.default.sign({
                        id: decoded.id,
                        rol: decoded.rol,
                        idEmpleado: decoded.idEmpleado,
                        idCliente: decoded.idCliente,
                    }, 'CLAVE_SECRETA_SUPERSEGURA', { expiresIn: '30m' });
                    res.json({
                        message: 'Sesión extendida',
                        token: newToken,
                    });
                }
                else {
                    return res.status(400).json({ message: "Token no válido o mal formado" });
                }
            }
            catch (error) {
                console.error('Error al extender la sesión:', error);
                res.status(500).json({ message: 'Error al extender la sesión' });
            }
        });
    }
    cifrarPasswordManual() {
        return __awaiter(this, void 0, void 0, function* () {
            const email = "cristel23rr@gmail.com";
            const nueva = "Passwd1234";
            const hashed = yield bcryptjs_1.default.hash(nueva, 10);
            const pool = yield (0, db_1.connectDB)();
            yield pool.request()
                .input("pass", hashed)
                .input("email", email)
                .query("UPDATE tblUsuario SET pass = @pass WHERE nombreUsuario = @email");
        });
    }
}
exports.usuarioController = new UsuarioController();
