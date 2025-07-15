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
Object.defineProperty(exports, "__esModule", { value: true });
const mailer_1 = require("./mailer");
const testEmail = () => __awaiter(void 0, void 0, void 0, function* () {
    const destinatario = 'alexisdgalindo88@gmail.com';
    const asunto = 'Prueba de envío de correo';
    const mensaje = '<h1>Este es un correo de prueba</h1><p>Hola, este es un mensaje de prueba.</p>';
    yield (0, mailer_1.enviarCorreo)(destinatario, asunto, mensaje);
});
testEmail().catch(logger.error);
