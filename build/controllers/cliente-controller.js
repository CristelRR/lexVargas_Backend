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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clienteController = void 0;
const cliente_model_1 = __importDefault(require("../models/cliente-model")); // Asegúrate de tener el modelo correspondiente
const logger_1 = __importDefault(require("../logger/logger"));
class ClienteController {
    constructor() {
        this.getClienteById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idCliente = Number(req.params.idCliente);
                if (isNaN(idCliente)) {
                    return res.status(400).json({ message: 'ID inválido' });
                }
                const cliente = yield cliente_model_1.default.findById(idCliente);
                if (cliente.length === 0) {
                    return res.status(404).json({ message: 'Cliente no encontrado' });
                }
                res.status(200).json(cliente[0]);
            }
            catch (error) {
                logger_1.default.error('Error al obtener cliente por ID:', error);
                res.status(500).json({ message: 'Error al obtener cliente' });
            }
        });
    }
    getClientes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientes = yield cliente_model_1.default.getClientes();
                res.json(clientes);
            }
            catch (error) {
                logger_1.default.error('Error al obtener clientes:', error);
                res.status(500).json({ message: 'Error al obtener clientes' });
            }
        });
    }
    crearCliente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.body, { correo } = _a, restoDeDatos = __rest(_a, ["correo"]);
                // Verificar si el correo ya existe
                const correoExistente = yield cliente_model_1.default.verificarCorreoExistente(correo);
                if (correoExistente) {
                    return res.status(400).json({ message: 'Este correo ya está registrado.' });
                }
                // Crear cliente
                yield cliente_model_1.default.crearCliente(req.body);
                // Obtener cliente recién creado
                const clienteCreado = yield cliente_model_1.default.getClienteByCorreo(correo);
                if (!clienteCreado) {
                    return res.status(500).json({ message: 'Cliente creado pero no se pudo recuperar.' });
                }
                // Devolver cliente creado
                res.status(201).json(clienteCreado);
            }
            catch (error) {
                logger_1.default.error('Error al crear cliente:', error);
                res.status(500).json({ message: 'Error al crear cliente' });
            }
        });
    }
    updateCliente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idCliente = Number(req.params.idCliente); // Obtiene el ID del cliente desde los parámetros de la URL
                if (isNaN(idCliente)) {
                    return res.status(400).json({ message: 'ID inválido' });
                }
                const clienteData = req.body; // Obtiene los datos del cliente desde el cuerpo de la solicitud
                yield cliente_model_1.default.updateCliente(idCliente, clienteData); // Llama al método de actualización en el modelo
                res.json({ message: 'Cliente actualizado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al actualizar cliente:', error);
                res.status(500).json({ message: 'Error al actualizar cliente' });
            }
        });
    }
    deleteCliente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idCliente = Number(req.params.idCliente);
                if (isNaN(idCliente)) {
                    return res.status(400).json({ message: 'ID inválido' });
                }
                yield cliente_model_1.default.deleteCliente(idCliente);
                res.json({ message: 'Cliente eliminado exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al eliminar cliente:', error);
                res.status(500).json({ message: 'Error al eliminar cliente' });
            }
        });
    }
}
exports.clienteController = new ClienteController();
