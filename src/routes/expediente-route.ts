import { Router } from "express";
import { expedienteNController } from "../controllers/expediente-controller";

class ExpedienteNRoutes {
    public router: Router = Router();

    constructor() {
        this.config();
    }

    config() {
        this.router.get('/', expedienteNController.getExpedientes);
        this.router.post('/', expedienteNController.crearExpediente);
        this.router.put('/', expedienteNController.updateExpediente);
        this.router.delete('/:id', expedienteNController.deleteExpediente);
        this.router.get('/informacion-general/:idExpediente', expedienteNController.informacionGeneral);
        this.router.get('/partes-expediente/:idExpediente', expedienteNController.obtenerPartes);
        this.router.post('/agregar-parte/:idExpediente', expedienteNController.agregarParte);    }
}

const expedienteNRoutes = new ExpedienteNRoutes();
export default expedienteNRoutes.router;
