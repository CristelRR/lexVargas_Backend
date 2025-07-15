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
exports.notaController = void 0;
const nota_modal_1 = __importDefault(require("../models/nota-modal"));
const logger_1 = __importDefault(require("../logger/logger"));
class NotaController {
    /**
     * Obtener todas las notas
     */
    getNotas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notas = yield nota_modal_1.default.getNotas();
                res.json(notas);
            }
            catch (error) {
                logger_1.default.error('Error al obtener notas:', error);
                res.status(500).json({ message: 'Error al obtener notas' });
            }
        });
    }
    /**
     * Obtener notas por cita o expediente
     */
    getNotasPorCitaOExpediente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCita, idExpediente } = req.query;
                if (!idCita && !idExpediente) {
                    return res.status(400).json({ message: 'Debe proporcionar un ID de cita o expediente' });
                }
                const notas = yield nota_modal_1.default.getNotasPorCitaOExpediente(idCita ? Number(idCita) : null, idExpediente ? Number(idExpediente) : null);
                res.json(notas);
            }
            catch (error) {
                logger_1.default.error('Error al obtener notas:', error);
                res.status(500).json({ message: 'Error al obtener notas' });
            }
        });
    }
    /**
     * Crear una nueva nota
     */
    crearNota(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { titulo, descripcion, tipoNota, idCitaFK, idExpedienteFK } = req.body;
                if (!titulo || !descripcion || !tipoNota || !idCitaFK || !idExpedienteFK) {
                    return res.status(400).json({ message: 'Faltan campos obligatorios' });
                }
                const nuevaNota = {
                    titulo,
                    descripcion,
                    tipoNota,
                    idCitaFK,
                    idExpedienteFK,
                    fechaCreacion: new Date(),
                    ultimaActualizacion: new Date(),
                    estado: 'activa',
                };
                yield nota_modal_1.default.crearNota(nuevaNota); // Llama al modelo para guardar la nota
                res.status(201).json({ message: 'Nota creada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al crear nota:', error);
                res.status(500).json({ message: 'Error al crear nota' });
            }
        });
    }
    /**
     * Actualizar una nota existente
     */
    updateNota(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notaData = req.body; // Asegúrate de validar los datos aquí
                if (!notaData.idNota) {
                    return res.status(400).json({ message: 'El ID de la nota es obligatorio' });
                }
                yield nota_modal_1.default.updateNota(notaData);
                res.json({ message: 'Nota actualizada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al actualizar nota:', error);
                res.status(500).json({ message: 'Error al actualizar nota' });
            }
        });
    }
    /**
     * Eliminar una nota
     */
    deleteNota(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idNota } = req.body; // Asegúrate de validar el ID aquí
                if (!idNota) {
                    return res.status(400).json({ message: 'El ID de la nota es obligatorio' });
                }
                yield nota_modal_1.default.deleteNota(Number(idNota));
                res.json({ message: 'Nota eliminada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al eliminar nota:', error);
                res.status(500).json({ message: 'Error al eliminar nota' });
            }
        });
    }
    /**
     * Obtener una nota por su ID
     */
    getNotaById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idNota } = req.params;
                if (!idNota) {
                    return res.status(400).json({ message: 'El ID de la nota es obligatorio' });
                }
                const nota = yield nota_modal_1.default.findById(Number(idNota));
                if (!nota.length) {
                    return res.status(404).json({ message: 'Nota no encontrada' });
                }
                res.json(nota[0]);
            }
            catch (error) {
                logger_1.default.error('Error al obtener la nota:', error);
                res.status(500).json({ message: 'Error al obtener la nota' });
            }
        });
    }
    /**
 * Obtener notas por ID de la cita
 */
    getNotasPorCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCita } = req.params; // Se espera que el ID de la cita venga como parámetro de ruta
                if (!idCita) {
                    return res.status(400).json({ message: 'El ID de la cita es obligatorio' });
                }
                const notas = yield nota_modal_1.default.findNotasByCitaId(Number(idCita));
                if (!notas.length) {
                    return res.status(404).json({ message: 'No se encontraron notas para la cita proporcionada' });
                }
                res.json(notas);
            }
            catch (error) {
                logger_1.default.error('Error al obtener notas por cita:', error);
                res.status(500).json({ message: 'Error al obtener notas por cita' });
            }
        });
    }
}
exports.notaController = new NotaController();
