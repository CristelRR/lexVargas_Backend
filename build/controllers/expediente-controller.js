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
exports.expedienteNController = void 0;
const expediente_model_1 = __importDefault(require("../models/expediente-model"));
const logger_1 = __importDefault(require("../logger/logger"));
class ExpedienteNController {
    getExpedientes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const expedientes = yield expediente_model_1.default.getExpedientes();
                res.json(expedientes);
            }
            catch (error) {
                logger_1.default.error('Error al obtener expedientes:', error);
                res.status(500).json({ message: 'Error al obtener expedientes' });
            }
        });
    }
    crearExpediente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const expedienteData = req.body; // Asegúrate de validar los datos aquí
                yield expediente_model_1.default.crearExpediente(expedienteData);
                res.status(201).json({ message: 'Expediente creada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al crear expediente:', error);
                res.status(500).json({ message: 'Error al crear expediente' });
            }
        });
    }
    updateExpediente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const expedienteData = req.body; // Asegúrate de validar los datos aquí
                yield expediente_model_1.default.updateExpediente(expedienteData);
                res.json({ message: 'Expediente actualizada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al actualizar expediente:', error);
                res.status(500).json({ message: 'Error al actualizar expediente' });
            }
        });
    }
    deleteExpediente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idExpediente } = req.body; // Asegúrate de validar el ID aquí
                yield expediente_model_1.default.deleteExpediente(idExpediente);
                res.json({ message: 'Expediente eliminada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al eliminar expediente:', error);
                res.status(500).json({ message: 'Error al eliminar expediente' });
            }
        });
    }
    // Método findById agregado
    findById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params; // Cambié a req.params porque típicamente el ID viene en la URL
                const expediente = yield expediente_model_1.default.findById(parseInt(id));
                if (!expediente) {
                    return res.status(404).json({ message: 'Expediente no encontrado' });
                }
                res.json(expediente);
            }
            catch (error) {
                logger_1.default.error('Error al obtener expediente:', error);
                res.status(500).json({ message: 'Error al obtener expediente' });
            }
        });
    }
    //MÈTODO INFORMACIÒN GENERAL POR NUMERO DE EXPEDIENTE
    informacionGeneral(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idExpediente } = req.params; // Obtener el número de expediente de los parámetros de la URL
                if (!idExpediente) {
                    return res.status(400).json({ message: "El número de expediente es requerido" });
                }
                const expediente = yield expediente_model_1.default.informacionGeneral(idExpediente);
                if (!expediente) {
                    return res.status(404).json({ message: "Expediente no encontrado" });
                }
                res.json(expediente); // Enviar el expediente como respuesta
            }
            catch (error) {
                logger_1.default.error("Error al obtener la información general del expediente:", error);
                res.status(500).json({ message: "Error al obtener la información general del expediente" });
            }
        });
    }
    obtenerPartes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idExpediente } = req.params;
                if (!idExpediente) {
                    return res.status(400).json({ message: 'El número de expediente es requerido.' });
                }
                const partes = yield expediente_model_1.default.getPartesPorExpediente(idExpediente);
                // Verifica que partes es un arreglo antes de usar .filter
                if (!Array.isArray(partes)) {
                    return res.status(500).json({ message: 'Error: El resultado no es una lista de partes válida.' });
                }
                const response = {
                    demandantes: partes.filter(p => p.tipoParte === 'Demandante'),
                    demandados: partes.filter(p => p.tipoParte === 'Demandado'),
                    terceros: partes.filter(p => p.tipoParte === 'Tercero')
                };
                res.json(response);
            }
            catch (error) {
                logger_1.default.error('Error al obtener las partes del expediente:', error);
                res.status(500).json({ message: 'Error interno del servidor.' });
            }
        });
    }
    agregarParte(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tipoParte, parteData } = req.body;
                if (!tipoParte || !parteData) {
                    return res.status(400).json({ message: 'Tipo de parte y datos son requeridos.' });
                }
                let result;
                switch (tipoParte) {
                    case 'Demandante':
                        result = yield expediente_model_1.default.agregarParteDemandante(parteData);
                        break;
                    case 'Demandado':
                        result = yield expediente_model_1.default.agregarParteDemandada(parteData);
                        break;
                    case 'Tercero':
                        result = yield expediente_model_1.default.agregarTerceroRelacionado(parteData);
                        break;
                    default:
                        return res.status(400).json({ message: 'Tipo de parte no válido.' });
                }
                res.status(201).json({
                    message: 'Parte agregada exitosamente.',
                    parte: result
                });
            }
            catch (error) {
                logger_1.default.error('Error al agregar parte:', error);
                res.status(500).json({ message: 'Error interno del servidor.' });
            }
        });
    }
}
exports.expedienteNController = new ExpedienteNController();
