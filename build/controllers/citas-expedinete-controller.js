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
exports.citaExpedienteController = void 0;
const cita_expediente_model_1 = __importDefault(require("../models/cita-expediente-model"));
const logger_1 = __importDefault(require("../logger/logger"));
class CitaExpedienteController {
    getCitasExpediente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { idExpediente } = req.params; // Obtén el ID del expediente desde los parámetros
            try {
                // Valida que idExpediente sea un número válido
                if (!idExpediente || isNaN(Number(idExpediente))) {
                    return res.status(400).json({ message: "ID de expediente inválido." });
                }
                const citas = yield cita_expediente_model_1.default.getCitasExpediente(Number(idExpediente));
                return res.json(citas); // Asegúrate de retornar la respuesta
            }
            catch (error) {
                logger_1.default.error("Error al obtener citas:", error);
                return res.status(500).json({ message: "Error al obtener citas" }); // Asegúrate de retornar la respuesta
            }
        });
    }
    getExpediente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const expediente = yield cita_expediente_model_1.default.getExpediente();
                res.json(expediente);
            }
            catch (error) {
                logger_1.default.error('Error al obtener expediente:', error);
                res.status(500).json({ message: 'Error al obtener expediente' });
            }
        });
    }
    crearCitaExpediente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const citaData = req.body; // Asegúrate de validar los datos aquí
                const isCreated = yield cita_expediente_model_1.default.crearCitaExpediente(citaData);
                if (isCreated) {
                    res.status(201).json({ message: 'Cita creada exitosamente' });
                }
                else {
                    res.status(400).json({ message: 'No se pudo crear la cita' });
                }
            }
            catch (error) {
                logger_1.default.error('Error al crear cita:', error);
                res.status(500).json({ message: 'Error al crear cita' });
            }
        });
    }
    updateCitaExpediente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const citaData = req.body;
                const isUpdated = yield cita_expediente_model_1.default.updateCitaExpediente(citaData);
                if (isUpdated) {
                    res.json({ message: 'Cita actualizada exitosamente' });
                }
                else {
                    res.status(400).json({ message: 'No se pudo actualizar la cita' });
                }
            }
            catch (error) {
                logger_1.default.error('Error al actualizar cita:', error);
                res.status(500).json({ message: 'Error al actualizar cita' });
            }
        });
    }
    deleteCitaExpediente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCita } = req.body; // Asegúrate de validar el ID aquí
                const isDeleted = yield cita_expediente_model_1.default.deleteCitaExpediente(idCita);
                if (isDeleted) {
                    res.json({ message: 'Cita eliminada exitosamente' });
                }
                else {
                    res.status(400).json({ message: 'No se pudo eliminar la cita' });
                }
            }
            catch (error) {
                logger_1.default.error('Error al eliminar cita:', error);
                res.status(500).json({ message: 'Error al eliminar cita' });
            }
        });
    }
}
exports.citaExpedienteController = new CitaExpedienteController();
