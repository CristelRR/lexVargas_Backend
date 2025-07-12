import { Request, Response } from "express";
import citaModel from "../models/cita-model";
import { notificarClienteCita } from "./notificar-cita-cliente";
import { enviarCorreo } from "../config/mailer"; 
import moment from 'moment';



class CitaController {
    async getCitas(req: Request, res: Response) {
        try {
            const citas = await citaModel.getCitas();
            res.json(citas);
        } catch (error) {
            console.error('Error al obtener citas:', error);
            res.status(500).json({ message: 'Error al obtener citas' });
        }
    }

    async crearCita(req: Request, res: Response) {
        try {
            const citaData = req.body; // Asegúrate de validar los datos aquí
            await citaModel.crearCita(citaData);
            res.status(201).json({ message: 'Cita creada exitosamente' });
        } catch (error) {
            console.error('Error al crear cita:', error);
            res.status(500).json({ message: 'Error al crear cita' });
        }
    }

    async updateCita(req: Request, res: Response) {
        try {
            const citaData = req.body; // Asegúrate de validar los datos aquí
            await citaModel.updateCita(citaData);
            res.json({ message: 'Cita actualizada exitosamente' });
        } catch (error) {
            console.error('Error al actualizar cita:', error);
            res.status(500).json({ message: 'Error al actualizar cita' });
        }
    }

    async deleteCita(req: Request, res: Response) {
        try {
            const { idCita } = req.body; // Asegúrate de validar el ID aquí
            await citaModel.deleteCita(idCita);
            res.json({ message: 'Cita eliminada exitosamente' });
        } catch (error) {
            console.error('Error al eliminar cita:', error);
            res.status(500).json({ message: 'Error al eliminar cita' });
        }
    }

    async getAbogadosPorServicio(req: Request, res: Response) {
        try {
            const { idServicio } = req.params; // Obtiene el ID del servicio de los parámetros de la URL
            const abogados = await citaModel.getAbogadosPorServicio(Number(idServicio));
            res.json(abogados);
        } catch (error) {
            console.error('Error al obtener abogados:', error);
            res.status(500).json({ message: 'Error al obtener abogados' });
        }
    }

    async getHorariosDisponiblesPorAbogado(req: Request, res: Response) {
        try {
            const { idAbogado } = req.params; // Obtiene el ID del abogado de los parámetros de la URL
            const horarios = await citaModel.getHorariosDisponiblesPorAbogado(Number(idAbogado));
            res.json(horarios);
        } catch (error) {
            console.error('Error al obtener horarios disponibles:', error);
            res.status(500).json({ message: 'Error al obtener horarios disponibles' });
        }
    }

    async crearCitaConTransaccion(req: Request, res: Response) {
        try {
            const citaData = req.body;
    
            // Llama al modelo para crear la cita en una transacción
            const result = await citaModel.crearCitaConTransaccion(citaData);
    
            // Obtén los datos de la cita que se acaba de crear
            const cita = await citaModel.findById(result.idCita);
            if (!cita) {
                return res.status(500).json({ message: "No se encontró la información de la cita recién creada" });
            }
    
            // Obtén los datos del cliente desde la base de datos
            const datosCliente = await citaModel.obtenerDatosCliente(citaData.idClienteFK);
            if (!datosCliente || !datosCliente.emailCliente) {
                return res.status(500).json({ message: "No se encontró el correo del cliente" });
            }
    
            // Envía la notificación por correo electrónico usando los datos del cliente y la cita
            const { emailCliente, nombreCliente, aPCliente, aMCliente } = datosCliente;
            const clienteNombre = `${nombreCliente} ${aPCliente} ${aMCliente}`;
    
            // Formatear la fecha de la cita antes de usarla
            const fechaCitaFormateada = moment(cita.fechaCita).format('DD-MM-YYYY HH:mm');
            const motivoCita = cita.motivo;
            const abogadoNombre = `${cita.abogadoNombre} ${cita.abogadoApellidoPaterno} ${cita.abogadoApellidoMaterno}`;
            const nombreServicio = cita.nombreServicio;
            const descripcionServicio = cita.descripcionServicio;
            const costoServicio = cita.costoServicio;
    
            if (emailCliente) {
                await notificarClienteCita(
                    emailCliente,
                    clienteNombre,
                    fechaCitaFormateada,
                    motivoCita,
                    abogadoNombre,
                    nombreServicio,
                    descripcionServicio,
                    costoServicio
                );
            } else {
                console.error('No se encontró un correo electrónico válido para el cliente');
            }
    
            res.status(201).json({ message: result.message, notification: 'Correo de notificación enviado' });
        } catch (error: any) {
            console.error('Error al crear cita con transacción:', error);
            res.status(500).json({ message: 'Error al crear cita con transacción', error: error.message });
        }
    }
    
    // Método para cancelar cita
    async cancelarCita(req: Request, res: Response) {
        try {
            const { idCita } = req.body;
            if (!idCita) {
                return res.status(400).json({ message: 'ID de cita no proporcionado' });
            }

            // Llama al método cancelarCita del modelo
            const result = await citaModel.cancelarCita(Number(idCita));

            // Obtener los datos de la cita y del cliente
            const cita = await citaModel.findById(idCita);

            if (cita.length > 0) {
                const cliente = await citaModel.obtenerDatosCliente(cita[0].idClienteFK);

                if (cliente && cliente.emailCliente) {
                    const { emailCliente, nombreCliente, aPCliente, aMCliente } = cliente;
                    const clienteNombre = `${nombreCliente} ${aPCliente} ${aMCliente}`;
                    const motivoCita = cita[0].motivo;
                    const fechaCitaRaw = cita[0].fechaCita;


                    if (fechaCitaRaw) {
                        // Utilizando moment para formatear la fecha
                        const fechaCitaObj = moment(fechaCitaRaw);
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
                            await enviarCorreo(emailCliente, asunto, contenido);
                        } else {
                            console.error('Error: La fecha de la cita no es válida.');
                        }
                    } else {
                        console.error('Error: No se encontró la fecha de la cita.');
                    }
                } else {
                    console.error('No se encontró un correo electrónico válido para el cliente.');
                }
            } else {
                console.error('No se encontró información de la cita.');
            }

            res.json(result); // Responde con el resultado de la operación
        } catch (error) {
            console.error('Error al cancelar la cita:', error);
            res.status(500).json({ message: 'Error al cancelar la cita' });
        }
    }

    //Método para completar cita
    async completarCita(req: Request, res: Response) {
        try {
          const { idCita } = req.params; // Asegúrate de usar req.params
      
          if (!idCita) {
            return res.status(400).json({ message: 'ID de cita no proporcionado' });
          }
      
          await citaModel.completarCita(Number(idCita));
          res.json({ message: 'Cita completada exitosamente' });
        } catch (error) {
          console.error('Error al completar la cita:', error);
          res.status(500).json({ message: 'Error al completar la cita' });
        }
      }
      
  
 
    async getCitasByCliente(req: Request, res: Response) {
        try {
            const { idCliente } = req.params; // Obtiene el ID del cliente de los parámetros de la URL
            const citas = await citaModel.getCitasByCliente(Number(idCliente));
            res.json(citas);
        } catch (error) {
            console.error('Error al obtener citas del cliente:', error);
            res.status(500).json({ message: 'Error al obtener citas del cliente' });
        }
    }

    // Método para obtener las citas de un abogado específico
    async getCitasByAbogado(req: Request, res: Response) {
        try {
            const { idAbogado } = req.params;  // Obtiene el idAbogado de los parámetros de la URL
            const citas = await citaModel.getCitasByAbogado(Number(idAbogado));  // Llama al modelo con el idAbogado
            res.json(citas);  // Devuelve las citas como respuesta
        } catch (error) {
            console.error('Error al obtener citas del abogado:', error);
            res.status(500).json({ message: 'Error al obtener citas del abogado' });
        }
    }

    // Método para obtener las citas de un abogado específico
    async getCitasBySecretaria(req: Request, res: Response) {
        try {
            // Llama al modelo para obtener todas las citas (en el caso de secretaría)
            const citas = await citaModel.getAllCitas();  // Asegúrate de que el método esté implementado en el modelo
            res.json(citas);  // Devuelve las citas como respuesta
        } catch (error) {
            console.error('Error al obtener las citas:', error);
            res.status(500).json({ message: 'Error al obtener las citas' });
        }
    }


    // Método para obtener los clientes únicos con citas programadas para un abogado específico
    async getClientesPorAbogado(req: Request, res: Response) {
        try {
            const { idAbogado } = req.params;  // Obtiene el idAbogado de los parámetros de la URL
            const clientes = await citaModel.getClientesPorAbogado(Number(idAbogado));  // Llama al modelo para obtener clientes únicos
            res.json(clientes);  // Envía los clientes como respuesta en formato JSON
        } catch (error) {
            console.error('Error al obtener clientes del abogado:', error);
            res.status(500).json({ message: 'Error al obtener clientes del abogado' });
        }
    }


    // Método para obtener los servicios asociados a las citas de un cliente
     async getServiciosPorCitasDeCliente(req: Request, res: Response) {
        try {
            const { idCliente } = req.params;
            const servicios = await citaModel.getServiciosPorCitasDeCliente(Number(idCliente));
            res.json(servicios);
        } catch (error) {
            console.error('Error al obtener servicios asociados a las citas del cliente:', error);
            res.status(500).json({ message: 'Error al obtener servicios asociados a las citas del cliente' });
        }
    }

    // Método para obtener todas las citas con información detallada
    async getAllCitas(req: Request, res: Response) {
        try {
            const citas = await citaModel.getAllCitas();
            res.json(citas);
        } catch (error) {
            console.error('Error al obtener todas las citas:', error);
            res.status(500).json({ message: 'Error al obtener todas las citas' });
        }
    }

    //Método para consutar las citas que pertenecen a un expediente
    async getCitasCompletadasByExpediente(req: Request, res: Response) {
        try {
            const { idExpediente } = req.params; // Obtener el número de expediente desde los parámetros
            if (!idExpediente) {
                return res.status(400).json({ message: 'Número de expediente no proporcionado' });
            }
    
            const citas = await citaModel.getCitasCompletadasByExpediente(idExpediente);
            res.json(citas); // Responder con las citas completadas
        } catch (error) {
            console.error('Error al obtener citas completadas por expediente:', error);
            res.status(500).json({ message: 'Error al obtener citas completadas por expediente' });
        }
    }    

}

export const citaController = new CitaController();
