import { Router } from "express";
import { usuarioController } from "../controllers/usuario-controller";
import { verificarToken, verificarRol, verificarCualquierRol } from "../middlewares/auth.middleware";

class UsuarioRoutes {
    public router: Router = Router();

    constructor() {
        this.config();
    }

    config() {
        // RUTAS PÚBLICAS
        this.router.post('/login', usuarioController.login);
        this.router.post('/verify-otp', usuarioController.verificarOTP); 
        this.router.post('/recuperar-contrasena', usuarioController.enviarCorreoRecuperacion);
        this.router.post('/restablecer-contrasena', usuarioController.restablecerContrasena);
        this.router.post('/extender-sesion', usuarioController.extenderSesion);

        // RUTAS PROTEGIDAS: SOLO USUARIOS AUTENTICADOS CON ROL 1 (Secretaria)
        this.router.get('/', verificarToken, verificarRol(1), usuarioController.getUsuarios);
        this.router.post('/', verificarToken, verificarCualquierRol([1,2]), usuarioController.crearUsuario);
        this.router.put('/', verificarToken, verificarRol(1), usuarioController.updateUsuario);
        this.router.delete('/', verificarToken, verificarRol(1), usuarioController.deleteUsuario);
        this.router.post('/cifrar-manual', usuarioController.cifrarPasswordManual);
    }
}

const usuarioRoutes = new UsuarioRoutes();
export default usuarioRoutes.router;