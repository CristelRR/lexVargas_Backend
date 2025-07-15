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
exports.especialidadController = void 0;
const especialidad_model_1 = __importDefault(require("../models/especialidad-model"));
const logger_1 = __importDefault(require("../logger/logger"));
class EspecialidadController {
    getEspecialidades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const especialidades = yield especialidad_model_1.default.getEspecialidades();
                res.json(especialidades);
            }
            catch (error) {
                logger_1.default.error('Error al obtener especialidades:', error);
                res.status(500).json({ message: 'Error al obtener especialidades' });
            }
        });
    }
    crearEspecialidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const especialidadData = req.body; // Asegúrate de validar los datos aquí
                yield especialidad_model_1.default.crearEspecialidad(especialidadData);
                res.status(201).json({ message: 'Especialidad creada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al crear especialidad:', error);
                res.status(500).json({ message: 'Error al crear especialidad' });
            }
        });
    }
    updateEspecialidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const especialidadData = req.body; // Asegúrate de validar los datos aquí
                yield especialidad_model_1.default.updateEspecialidad(especialidadData);
                res.json({ message: 'Especialidad actualizada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al actualizar especialidad:', error);
                res.status(500).json({ message: 'Error al actualizar especialidad' });
            }
        });
    }
    deleteEspecialidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idEspecialidad } = req.body; // Asegúrate de validar el ID aquí
                yield especialidad_model_1.default.deleteEspecialidad(idEspecialidad);
                res.json({ message: 'Especialidad eliminada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al eliminar especialidad:', error);
                res.status(500).json({ message: 'Error al eliminar especialidad' });
            }
        });
    }
}
exports.especialidadController = new EspecialidadController();
