import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { connectDB } from './config/db';
import rolRoutes from './routes/rol-route';
import empleadoRoutes from './routes/empleado-route';
import citaRoutes from './routes/cita-route';
import clienteRoutes from './routes/cliente-route';
import usuarioRoutes from './routes/usuario-route';
import servicioRoutes from './routes/servicio-route';
import especialidadRoutes from './routes/especialidad-route';
import agendaRoutes from './routes/agenda-route';
import loginRoutes from './routes/login-routes';
import registerRoutes from './routes/register-routes';
import expedienteRoutes from './routes/upload-file-routes';
import pagoRoutes from './routes/gestionPago-route';
import expedienteNRoutes from './routes/expediente-route';
import notaRoutes from './routes/nota-route';
import cargarDocumentosRoute from './routes/cargarDocumentos-route';
import citasExpedientesRoutes from './routes/citas-expedientes-routes';
import './jobs/temporalidadJob';
//import './jobs/actualizacion-citas';

class Server {
    public app: Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.connectToDatabase();
    }

    config(): void {
        this.app.set('port', process.env.PORT || 3000);
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(morgan('dev'));
        this.app.use(cors());

    }

    async connectToDatabase(): Promise<void> {
        try {
            await connectDB();
        } catch (error: any) {
            console.error('Error al conectar a la base de datos:', error.message);
            process.exit(1);
        }
    }

    routes(): void {
        this.app.get('/', (req, res) => {
            res.send('¡Hola, mundo!');
        });
        this.app.use('/roles', rolRoutes);
        this.app.use('/empleados', empleadoRoutes);
        this.app.use('/register', registerRoutes);
        this.app.use('/login', loginRoutes);
        this.app.use('/clientes', clienteRoutes);
        this.app.use('/citas', citaRoutes);
        this.app.use('/usuarios', usuarioRoutes);
        this.app.use('/servicios', servicioRoutes);
        this.app.use('/especialidades', especialidadRoutes);
        this.app.use('/agendas', agendaRoutes);
        this.app.use('/pagos', pagoRoutes);
        this.app.use('/expedientes', expedienteRoutes);
        this.app.use('/expedienteN', expedienteNRoutes);
        this.app.use('/notas', notaRoutes);

        this.app.use('/documentos', cargarDocumentosRoute);
        this.app.use('/citasExpediente', citasExpedientesRoutes);
    }

    start(): void {
        this.app.listen(this.app.get('port'), () => {
        });
    }
}

const server = new Server();
server.start();
