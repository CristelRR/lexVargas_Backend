import { citaExpedienteController } from "../controllers/citas-expedinete-controller";
import citaExpedienteModel from "../models/cita-expediente-model";
import { Router, Request, Response } from "express";



class CitaExpedienteRoutes {
    public router: Router = Router();

    constructor() {
        this.config();
    }

    config() {
        this.router.get('/expediente/:idExpediente', async (req: Request, res: Response) => {
            try {
                const idExpediente = parseInt(req.params.idExpediente, 10);
                const citas = await citaExpedienteModel.getCitasExpediente(idExpediente);
                res.status(200).json(citas);
            } catch (error) {
                res.status(500).json({ error: 'Error al obtener citas del expediente' });
            }
        });

        this.router.post('/', citaExpedienteController.crearCitaExpediente);
        this.router.put('/', citaExpedienteController.updateCitaExpediente);
        this.router.delete('/', citaExpedienteController.deleteCitaExpediente);
        this.router.get('/expediente', citaExpedienteController.getExpediente); // corregido
    }
}

const citaExpedienteRoutes = new CitaExpedienteRoutes();
export default citaExpedienteRoutes.router;