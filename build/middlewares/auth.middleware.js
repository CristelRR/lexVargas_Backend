"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarCualquierRol = exports.verificarRol = exports.verificarToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verificarToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Token requerido' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'CLAVE_SECRETA_SUPERSEGURA');
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};
exports.verificarToken = verificarToken;
const verificarRol = (rolEsperado) => {
    return (req, res, next) => {
        var _a;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.rol) !== rolEsperado) {
            return res.status(403).json({ message: 'Acceso denegado por rol' });
        }
        next();
    };
};
exports.verificarRol = verificarRol;
const verificarCualquierRol = (rolesPermitidos) => {
    return (req, res, next) => {
        var _a;
        const rolUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.rol;
        if (!rolesPermitidos.includes(rolUsuario)) {
            return res.status(403).json({ message: 'Acceso denegado por rol' });
        }
        next();
    };
};
exports.verificarCualquierRol = verificarCualquierRol;
