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
exports.citaController = void 0;
const cita_model_1 = __importDefault(require("../models/cita-model"));
const notificar_cita_cliente_1 = require("./notificar-cita-cliente");
const mailer_1 = require("../config/mailer");
const moment_1 = __importDefault(require("moment"));
const logger_1 = __importDefault(require("../logger/logger"));
class CitaController {
    getCitas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const citas = yield cita_model_1.default.getCitas();
                res.json(citas);
            }
            catch (error) {
                logger_1.default.error('Error al obtener citas:', error);
                res.status(500).json({ message: 'Error al obtener citas' });
            }
        });
    }
    crearCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const citaData = req.body; // Asegúrate de validar los datos aquí
                yield cita_model_1.default.crearCita(citaData);
                res.status(201).json({ message: 'Cita creada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al crear cita:', error);
                res.status(500).json({ message: 'Error al crear cita' });
            }
        });
    }
    updateCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const citaData = req.body; // Asegúrate de validar los datos aquí
                yield cita_model_1.default.updateCita(citaData);
                res.json({ message: 'Cita actualizada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al actualizar cita:', error);
                res.status(500).json({ message: 'Error al actualizar cita' });
            }
        });
    }
    deleteCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCita } = req.body; // Asegúrate de validar el ID aquí
                yield cita_model_1.default.deleteCita(idCita);
                res.json({ message: 'Cita eliminada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al eliminar cita:', error);
                res.status(500).json({ message: 'Error al eliminar cita' });
            }
        });
    }
    getAbogadosPorServicio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idServicio } = req.params; // Obtiene el ID del servicio de los parámetros de la URL
                const abogados = yield cita_model_1.default.getAbogadosPorServicio(Number(idServicio));
                res.json(abogados);
            }
            catch (error) {
                logger_1.default.error('Error al obtener abogados:', error);
                res.status(500).json({ message: 'Error al obtener abogados' });
            }
        });
    }
    getHorariosDisponiblesPorAbogado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idAbogado } = req.params; // Obtiene el ID del abogado de los parámetros de la URL
                const horarios = yield cita_model_1.default.getHorariosDisponiblesPorAbogado(Number(idAbogado));
                res.json(horarios);
            }
            catch (error) {
                logger_1.default.error('Error al obtener horarios disponibles:', error);
                res.status(500).json({ message: 'Error al obtener horarios disponibles' });
            }
        });
    }
    crearCitaConTransaccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const citaData = req.body;
                // Llama al modelo para crear la cita en una transacción
                const result = yield cita_model_1.default.crearCitaConTransaccion(citaData);
                // Obtén los datos de la cita que se acaba de crear
                const cita = yield cita_model_1.default.findById(result.idCita);
                if (!cita) {
                    return res.status(500).json({ message: "No se encontró la información de la cita recién creada" });
                }
                // Obtén los datos del cliente desde la base de datos
                const datosCliente = yield cita_model_1.default.obtenerDatosCliente(citaData.idClienteFK);
                if (!datosCliente || !datosCliente.emailCliente) {
                    return res.status(500).json({ message: "No se encontró el correo del cliente" });
                }
                // Envía la notificación por correo electrónico usando los datos del cliente y la cita
                const { emailCliente, nombreCliente, aPCliente, aMCliente } = datosCliente;
                const clienteNombre = `${nombreCliente} ${aPCliente} ${aMCliente}`;
                // Formatear la fecha de la cita antes de usarla
                const fechaCitaFormateada = (0, moment_1.default)(cita.fechaCita).format('DD-MM-YYYY HH:mm');
                const motivoCita = cita.motivo;
                const abogadoNombre = `${cita.abogadoNombre} ${cita.abogadoApellidoPaterno} ${cita.abogadoApellidoMaterno}`;
                const nombreServicio = cita.nombreServicio;
                const descripcionServicio = cita.descripcionServicio;
                const costoServicio = cita.costoServicio;
                if (emailCliente) {
                    yield (0, notificar_cita_cliente_1.notificarClienteCita)(emailCliente, clienteNombre, fechaCitaFormateada, motivoCita, abogadoNombre, nombreServicio, descripcionServicio, costoServicio);
                }
                else {
                    logger_1.default.error('No se encontró un correo electrónico válido para el cliente');
                }
                res.status(201).json({ message: result.message, notification: 'Correo de notificación enviado' });
            }
            catch (error) {
                logger_1.default.error('Error al crear cita con transacción:', error);
                res.status(500).json({ message: 'Error al crear cita con transacción', error: error.message });
            }
        });
    }
    // Método para cancelar cita
    cancelarCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCita } = req.body;
                if (!idCita) {
                    return res.status(400).json({ message: 'ID de cita no proporcionado' });
                }
                // Llama al método cancelarCita del modelo
                const result = yield cita_model_1.default.cancelarCita(Number(idCita));
                // Obtener los datos de la cita y del cliente
                const cita = yield cita_model_1.default.findById(idCita);
                if (cita.length > 0) {
                    const cliente = yield cita_model_1.default.obtenerDatosCliente(cita[0].idClienteFK);
                    if (cliente && cliente.emailCliente) {
                        const { emailCliente, nombreCliente, aPCliente, aMCliente } = cliente;
                        const clienteNombre = `${nombreCliente} ${aPCliente} ${aMCliente}`;
                        const motivoCita = cita[0].motivo;
                        const fechaCitaRaw = cita[0].fechaCita;
                        if (fechaCitaRaw) {
                            // Utilizando moment para formatear la fecha
                            const fechaCitaObj = (0, moment_1.default)(fechaCitaRaw);
                            if (fechaCitaObj.isValid()) {
                                const fecha = fechaCitaObj.format('DD-MM-YYYY');
                                const hora = fechaCitaObj.format('HH:mm');
                                // Construir el contenido del correo con la nueva estructura
                                const asunto = 'Cancelación de Cita';
                                const contenido = `
                                <p>Estimado ${clienteNombre},</p>
                                <p>Lamentamos informarle que su cita ha sido cancelada. A continuación, le proporcionamos los detalles de la cita:</p>
                                <ul>
                                    <li><strong>Motivo:</strong> ${motivoCita}</li>
                                    <li><strong>Fecha:</strong> ${fecha}</li>
                                    <li><strong>Hora:</strong> ${hora}</li>
                                </ul>
                                <p>Si necesita reprogramar la cita, no dude en ponerse en contacto con nosotros.</p>
                                <p>Gracias por su comprensión,<br>Equipo Legal.</p>
                            `;
                                // Enviar correo de notificación
                                yield (0, mailer_1.enviarCorreo)(emailCliente, asunto, contenido);
                            }
                            else {
                                logger_1.default.error('Error: La fecha de la cita no es válida.');
                            }
                        }
                        else {
                            logger_1.default.error('Error: No se encontró la fecha de la cita.');
                        }
                    }
                    else {
                        logger_1.default.error('No se encontró un correo electrónico válido para el cliente.');
                    }
                }
                else {
                    logger_1.default.error('No se encontró información de la cita.');
                }
                res.json(result); // Responde con el resultado de la operación
            }
            catch (error) {
                logger_1.default.error('Error al cancelar la cita:', error);
                res.status(500).json({ message: 'Error al cancelar la cita' });
            }
        });
    }
    //Método para completar cita
    completarCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCita } = req.params; // Asegúrate de usar req.params
                if (!idCita) {
                    return res.status(400).json({ message: 'ID de cita no proporcionado' });
                }
                yield cita_model_1.default.completarCita(Number(idCita));
                res.json({ message: 'Cita completada exitosamente' });
            }
            catch (error) {
                logger_1.default.error('Error al completar la cita:', error);
                res.status(500).json({ message: 'Error al completar la cita' });
            }
        });
    }
    getCitasByCliente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCliente } = req.params; // Obtiene el ID del cliente de los parámetros de la URL
                const citas = yield cita_model_1.default.getCitasByCliente(Number(idCliente));
                res.json(citas);
            }
            catch (error) {
                logger_1.default.error('Error al obtener citas del cliente:', error);
                res.status(500).json({ message: 'Error al obtener citas del cliente' });
            }
        });
    }
    // Método para obtener las citas de un abogado específico
    getCitasByAbogado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idAbogado } = req.params; // Obtiene el idAbogado de los parámetros de la URL
                const citas = yield cita_model_1.default.getCitasByAbogado(Number(idAbogado)); // Llama al modelo con el idAbogado
                res.json(citas); // Devuelve las citas como respuesta
            }
            catch (error) {
                logger_1.default.error('Error al obtener citas del abogado:', error);
                res.status(500).json({ message: 'Error al obtener citas del abogado' });
            }
        });
    }
    // Método para obtener las citas de un abogado específico
    getCitasBySecretaria(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Llama al modelo para obtener todas las citas (en el caso de secretaría)
                const citas = yield cita_model_1.default.getAllCitas(); // Asegúrate de que el método esté implementado en el modelo
                res.json(citas); // Devuelve las citas como respuesta
            }
            catch (error) {
                logger_1.default.error('Error al obtener las citas:', error);
                res.status(500).json({ message: 'Error al obtener las citas' });
            }
        });
    }
    // Método para obtener los clientes únicos con citas programadas para un abogado específico
    getClientesPorAbogado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idAbogado } = req.params; // Obtiene el idAbogado de los parámetros de la URL
                const clientes = yield cita_model_1.default.getClientesPorAbogado(Number(idAbogado)); // Llama al modelo para obtener clientes únicos
                res.json(clientes); // Envía los clientes como respuesta en formato JSON
            }
            catch (error) {
                logger_1.default.error('Error al obtener clientes del abogado:', error);
                res.status(500).json({ message: 'Error al obtener clientes del abogado' });
            }
        });
    }
    // Método para obtener los servicios asociados a las citas de un cliente
    getServiciosPorCitasDeCliente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCliente } = req.params;
                const servicios = yield cita_model_1.default.getServiciosPorCitasDeCliente(Number(idCliente));
                res.json(servicios);
            }
            catch (error) {
                logger_1.default.error('Error al obtener servicios asociados a las citas del cliente:', error);
                res.status(500).json({ message: 'Error al obtener servicios asociados a las citas del cliente' });
            }
        });
    }
    // Método para obtener todas las citas con información detallada
    getAllCitas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const citas = yield cita_model_1.default.getAllCitas();
                res.json(citas);
            }
            catch (error) {
                logger_1.default.error('Error al obtener todas las citas:', error);
                res.status(500).json({ message: 'Error al obtener todas las citas' });
            }
        });
    }
    //Método para consutar las citas que pertenecen a un expediente
    getCitasCompletadasByExpediente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idExpediente } = req.params; // Obtener el número de expediente desde los parámetros
                if (!idExpediente) {
                    return res.status(400).json({ message: 'Número de expediente no proporcionado' });
                }
                const citas = yield cita_model_1.default.getCitasCompletadasByExpediente(idExpediente);
                res.json(citas); // Responder con las citas completadas
            }
            catch (error) {
                logger_1.default.error('Error al obtener citas completadas por expediente:', error);
                res.status(500).json({ message: 'Error al obtener citas completadas por expediente' });
            }
        });
    }
}
exports.citaController = new CitaController();
