"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_controller_1 = require("../controllers/usuario-controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const ip_guard_middleware_1 = require("../middlewares/ip-guard.middleware");
class UsuarioRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        // RUTAS PÚBLICAS
        this.router.post('/login', ip_guard_middleware_1.ipAttackGuard, usuario_controller_1.usuarioController.login);
        this.router.post('/verify-otp', usuario_controller_1.usuarioController.verificarOTP);
        this.router.post('/recuperar-contrasena', usuario_controller_1.usuarioController.enviarCorreoRecuperacion);
        this.router.post('/restablecer-contrasena', usuario_controller_1.usuarioController.restablecerContrasena);
        this.router.post('/extender-sesion', usuario_controller_1.usuarioController.extenderSesion);
        // RUTAS PROTEGIDAS: SOLO USUARIOS AUTENTICADOS CON ROL 1 (Secretaria)
        this.router.get('/', auth_middleware_1.verificarToken, (0, auth_middleware_1.verificarRol)(1), usuario_controller_1.usuarioController.getUsuarios);
        this.router.post('/', auth_middleware_1.verificarToken, (0, auth_middleware_1.verificarCualquierRol)([1, 2]), usuario_controller_1.usuarioController.crearUsuario);
        this.router.put('/', auth_middleware_1.verificarToken, (0, auth_middleware_1.verificarRol)(1), usuario_controller_1.usuarioController.updateUsuario);
        this.router.delete('/', auth_middleware_1.verificarToken, (0, auth_middleware_1.verificarRol)(1), usuario_controller_1.usuarioController.deleteUsuario);
        this.router.post('/cifrar-manual', usuario_controller_1.usuarioController.cifrarPasswordManual);
    }
}
const usuarioRoutes = new UsuarioRoutes();
exports.default = usuarioRoutes.router;
