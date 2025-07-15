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
exports.empleadoController = void 0;
const empleado_model_1 = __importDefault(require("../models/empleado-model"));
const logger_1 = __importDefault(require("../logger/logger"));
class EmpleadoController {
    constructor() {
        this.getEmpleadoById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idEmpleado = Number(req.params.idEmpleado);
                if (isNaN(idEmpleado)) {
                    return res.status(400).json({ message: 'ID inválido' });
                }
                const empleado = yield empleado_model_1.default.getEmpleadoById(idEmpleado);
                if (!empleado) {
                    return res.status(404).json({ message: 'Empleado no encontrado' });
                }
                res.status(200).json(empleado);
            }
            catch (error) {
                logger_1.default.error('Error al obtener empleado por ID:', error);
                res.status(500).json({ message: 'Error al obtener empleado' });
            }
        });
    }
    getEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const empleados = yield empleado_model_1.default.getEmpleados();
                res.json(empleados);
            }
            catch (error) {
                logger_1.default.error('Error al obtener empleados:', error);
                res.status(500).json({ message: 'Error al obtener empleados' });
            }
        });
    }
    getAbogados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const empleados = yield empleado_model_1.default.getAbogados();
                res.json(empleados);
            }
            catch (error) {
                logger_1.default.error('Error al obtener abogados:', error);
                res.status(500).json({ message: 'Error al obtener abogados' });
            }
        });
    }
    crearEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const empleadoData = req.body;
                yield empleado_model_1.default.crearEmpleado(empleadoData);
                res.status(201).json({ message: 'Empleado creado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al crear empleado:', error);
                res.status(500).json({ message: 'Error al crear empleado' });
            }
        });
    }
    updateEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idEmpleado = Number(req.params.idEmpleado); // Obtén el ID del parámetro de la URL
                if (isNaN(idEmpleado)) {
                    return res.status(400).json({ message: 'ID inválido' });
                }
                const empleadoData = req.body; // Datos editables del empleado
                yield empleado_model_1.default.updateEmpleado(idEmpleado, empleadoData);
                res.json({ message: 'Empleado actualizado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al actualizar empleado:', error);
                res.status(500).json({ message: 'Error al actualizar empleado' });
            }
        });
    }
    deleteEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idEmpleado } = req.body; // Asegúrate de validar el ID aquí
                yield empleado_model_1.default.deleteEmpleado(idEmpleado);
                res.json({ message: 'Empleado eliminado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al eliminar empleado:', error);
                res.status(500).json({ message: 'Error al eliminar empleado' });
            }
        });
    }
}
exports.empleadoController = new EmpleadoController();
