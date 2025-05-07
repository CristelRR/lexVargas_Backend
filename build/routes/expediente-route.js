"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expediente_controller_1 = require("../controllers/expediente-controller");
class ExpedienteNRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/', expediente_controller_1.expedienteNController.getExpedientes);
        this.router.post('/', expediente_controller_1.expedienteNController.crearExpediente);
        this.router.put('/', expediente_controller_1.expedienteNController.updateExpediente);
        this.router.delete('/:id', expediente_controller_1.expedienteNController.deleteExpediente);
        this.router.get('/informacion-general/:idExpediente', expediente_controller_1.expedienteNController.informacionGeneral);
        this.router.get('/partes-expediente/:idExpediente', expediente_controller_1.expedienteNController.obtenerPartes);
        this.router.post('/agregar-parte/:idExpediente', expediente_controller_1.expedienteNController.agregarParte);
    }
}
const expedienteNRoutes = new ExpedienteNRoutes();
exports.default = expedienteNRoutes.router;
