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
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../config/db");
const logger_1 = __importDefault(require("../logger/logger")); // Ruta ajustada a tu estructura
function marcarCitasCompletadas() {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield (0, db_1.connectDB)();
        try {
            const result = yield pool.request().query(`
            UPDATE tblCita 
            SET estado = 'completada'
            WHERE estado = 'programada'
              AND (
                  (fechaCita < CAST(GETDATE() AS DATE)) OR 
                  (fechaCita = CAST(GETDATE() AS DATE) AND horaCita <= CAST(GETDATE() AS TIME))
              )
        `);
        }
        catch (error) {
            logger_1.default.error("Error al marcar citas como completadas:", error);
        }
    });
}
// Programa la tarea para ejecutarse cada hora
node_cron_1.default.schedule('0 * * * *', () => {
    marcarCitasCompletadas();
});
