import { enviarCorreo } from "./mailer";

const testEmail = async () => {
  const destinatario = 'alexisdgalindo88@gmail.com';
  const asunto = 'Prueba de envío de correo';
  const mensaje = '<h1>Este es un correo de prueba</h1><p>Hola, este es un mensaje de prueba.</p>';

  await enviarCorreo(destinatario, asunto, mensaje);
};

testEmail().catch(logger.error);
