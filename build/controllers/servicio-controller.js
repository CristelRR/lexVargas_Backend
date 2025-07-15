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
exports.servicioController = void 0;
const servicio_model_1 = __importDefault(require("../models/servicio-model"));
const logger_1 = __importDefault(require("../logger/logger"));
class ServicioController {
    getServicios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const servicios = yield servicio_model_1.default.getServicios();
                res.json(servicios);
            }
            catch (error) {
                logger_1.default.error('Error al obtener servicios:', error);
                res.status(500).json({ message: 'Error al obtener servicios' });
            }
        });
    }
    crearServicio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const servicioData = req.body; // Asegúrate de validar los datos aquí
                yield servicio_model_1.default.crearServicio(servicioData);
                res.status(201).json({ message: 'Servicio creado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al crear servicio:', error);
                res.status(500).json({ message: 'Error al crear servicio' });
            }
        });
    }
    updateServicio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const servicioData = req.body; // Asegúrate de validar los datos aquí
                yield servicio_model_1.default.updateServicio(servicioData);
                res.json({ message: 'Servicio actualizado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al actualizar servicio:', error);
                res.status(500).json({ message: 'Error al actualizar servicio' });
            }
        });
    }
    deleteServicio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idServicio } = req.body; // Asegúrate de validar el ID aquí
                yield servicio_model_1.default.deleteServicio(idServicio);
                res.json({ message: 'Servicio eliminado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al eliminar servicio:', error);
                res.status(500).json({ message: 'Error al eliminar servicio' });
            }
        });
    }
    // Método para obtener servicios de un abogado específico
    getServiciosPorAbogado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idAbogado = parseInt(req.params.idAbogado, 10);
                if (isNaN(idAbogado)) {
                    return res.status(400).json({ message: 'ID de abogado inválido' });
                }
                const servicios = yield servicio_model_1.default.getServiciosPorAbogado(idAbogado);
                res.json(servicios);
            }
            catch (error) {
                logger_1.default.error('Error al obtener servicios por abogado:', error);
                res.status(500).json({ message: 'Error al obtener servicios por abogado' });
            }
        });
    }
}
exports.servicioController = new ServicioController();
