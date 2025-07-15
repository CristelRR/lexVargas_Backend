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
exports.agendaController = void 0;
const agenda_model_1 = __importDefault(require("../models/agenda-model"));
const logger_1 = __importDefault(require("../logger/logger"));
class AgendaController {
    getAgendas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const agendas = yield agenda_model_1.default.getAgendas();
                res.json(agendas);
            }
            catch (error) {
                logger_1.default.error('Error al obtener agendas:', error);
                res.status(500).json({ message: 'Error al obtener agendas' });
            }
        });
    }
    crearAgenda(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const agendaData = req.body;
                yield agenda_model_1.default.crearAgenda(agendaData);
                res.status(201).json({ message: 'Agenda creado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al crear agenda:', error);
                res.status(500).json({ message: 'Error al crear agenda' });
            }
        });
    }
    updateAgenda(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idAgenda } = req.params; // Obtén el ID del parámetro de la URL
                const agendaData = Object.assign(Object.assign({}, req.body), { idAgenda: Number(idAgenda) }); // Asegúrate de que sea un número
                yield agenda_model_1.default.updateAgenda(agendaData);
                res.json({ message: 'Agenda actualizado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al actualizar agenda:', error);
                res.status(500).json({ message: 'Error al actualizar agenda' });
            }
        });
    }
    deleteAgenda(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idAgenda } = req.body; // Asegúrate de validar el ID aquí
                yield agenda_model_1.default.deleteAgenda(idAgenda);
                res.json({ message: 'Agenda eliminado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al eliminar agenda:', error);
                res.status(500).json({ message: 'Error al eliminar agenda' });
            }
        });
    }
}
exports.agendaController = new AgendaController();
