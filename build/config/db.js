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
exports.connectDB = void 0;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server = process.env.DB_SERVER || 'localhost';
const database = process.env.DB_DATABASE || 'LEXVARGAS_BD';
const port = Number(process.env.DB_PORT) || 1433;
const user = process.env.DB_USER || 'sa';
const password = process.env.DB_PASSWORD || 'Admin1234!';
if (!server || !database || !user || !password) {
    throw new Error('DB_SERVER, DB_DATABASE, DB_USER y DB_PASSWORD deben estar definidos en el archivo .env');
}
const dbConfig = {
    server: server,
    database: database,
    port: port,
    user: user,
    password: password,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield mssql_1.default.connect(dbConfig);
        console.log('Conectado a la base de datos SQL Server');
        return pool;
    }
    catch (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
