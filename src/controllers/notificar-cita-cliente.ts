import { enviarCorreo } from '../config/mailer';
import logger from "../logger/logger";

export const notificarClienteCita = async (
  clienteEmail: string,
  clienteNombre: string,
  fechaCita: string,
  motivoCita: string,
  abogadoNombre: string,
  nombreServicio: string,
  descripcionServicio: string,
  costoServicio: number
) => {
  const asunto = `Confirmación de Cita - ${clienteNombre}`;
  const mensaje = `
    <h3>Hola, ${clienteNombre}</h3>
    <p>Su cita ha sido programada con éxito. A continuación le proporcionamos los detalles de su cita:</p>
    <ul>
      <li><strong>Fecha:</strong> ${fechaCita}</li>
      <li><strong>Motivo:</strong> ${motivoCita}</li>
      <li><strong>Abogado Asignado:</strong> ${abogadoNombre}</li>
      <li><strong>Servicio:</strong> ${nombreServicio}</li>
      <li><strong>Descripción del Servicio:</strong> ${descripcionServicio}</li>
      <li><strong>Costo del Servicio:</strong> $${costoServicio.toFixed(2)}</li>
    </ul>
    <p>Si tiene alguna pregunta o necesita reprogramar, no dude en ponerse en contacto con nosotros.</p>
    <p>Gracias por confiar en nuestros servicios.</p>
  `;

  try {
    await enviarCorreo(clienteEmail, asunto, mensaje);
  } catch (error) {
    logger.error('Error al enviar el correo de confirmación:', error);
  }
};
