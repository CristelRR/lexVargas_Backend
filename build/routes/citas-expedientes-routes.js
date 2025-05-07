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
const citas_expedinete_controller_1 = require("../controllers/citas-expedinete-controller");
const cita_expediente_model_1 = __importDefault(require("../models/cita-expediente-model"));
const express_1 = require("express");
class CitaExpedienteRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get('/expediente/:idExpediente', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idExpediente = parseInt(req.params.idExpediente, 10);
                const citas = yield cita_expediente_model_1.default.getCitasExpediente(idExpediente);
                res.status(200).json(citas);
            }
            catch (error) {
                res.status(500).json({ error: 'Error al obtener citas del expediente' });
            }
        }));
        this.router.post('/', citas_expedinete_controller_1.citaExpedienteController.crearCitaExpediente);
        this.router.put('/', citas_expedinete_controller_1.citaExpedienteController.updateCitaExpediente);
        this.router.delete('/', citas_expedinete_controller_1.citaExpedienteController.deleteCitaExpediente);
        this.router.get('/expediente', citas_expedinete_controller_1.citaExpedienteController.getExpediente); // corregido
    }
}
const citaExpedienteRoutes = new CitaExpedienteRoutes();
exports.default = citaExpedienteRoutes.router;
