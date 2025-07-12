import sql from 'mssql';
import dotenv from 'dotenv';


dotenv.config();

const server = process.env.DB_SERVER;
const database = process.env.DB_DATABASE;
const port = Number(process.env.DB_PORT) || 1433;
const user = process.env.DB_USER ;
const password = process.env.DB_PASSWORD;

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


export const connectDB = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        return pool;
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1);
    }
};
