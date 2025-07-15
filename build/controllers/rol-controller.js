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
exports.rolController = void 0;
const rol_model_1 = __importDefault(require("../models/rol-model"));
const logger_1 = __importDefault(require("../logger/logger"));
class RolController {
    getRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roles = yield rol_model_1.default.getRoles();
                res.json(roles);
            }
            catch (error) {
                logger_1.default.error('Error al obtener roles:', error);
                res.status(500).json({ message: 'Error al obtener roles' });
            }
        });
    }
    crearRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rolData = req.body; // Asegúrate de validar los datos aquí
                yield rol_model_1.default.crearRol(rolData);
                res.status(201).json({ message: 'Rol creado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al crear rol:', error);
                res.status(500).json({ message: 'Error al crear rol' });
            }
        });
    }
    updateRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rolData = req.body; // Asegúrate de validar los datos aquí
                yield rol_model_1.default.updateRol(rolData);
                res.json({ message: 'Rol actualizado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al actualizar rol:', error);
                res.status(500).json({ message: 'Error al actualizar rol' });
            }
        });
    }
    deleteRol(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idRol } = req.body; // Asegúrate de validar el ID aquí
                yield rol_model_1.default.deleteRol(idRol);
                res.json({ message: 'Rol eliminado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al eliminar rol:', error);
                res.status(500).json({ message: 'Error al eliminar rol' });
            }
        });
    }
}
exports.rolController = new RolController();
