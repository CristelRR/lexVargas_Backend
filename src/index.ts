// src/index.ts
import dotenv from 'dotenv';
// 1) Carga .env antes de todo
dotenv.config();

// 2) Anula console.* en producción
if (process.env.NODE_ENV === 'production') {
  console.log   = () => {};
  console.info  = () => {};
  console.debug = () => {};
  console.warn  = () => {};
  // console.error = () => {}; // si quieres silenciar incluso errores
}

import express, { Application, Request, Response } from 'express';
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
// import './jobs/actualizacion-citas';
import { ipAttackGuard } from './middlewares/ip-guard.middleware';
import logger from './logger/logger';  // tu Winston logger

class Server {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.connectToDatabase();
  }

  config(): void {
    // Puerto
    this.app.set('port', process.env.PORT || 3000);

    // Body parser
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // 3) Morgan en dev vs prod
    if (process.env.NODE_ENV !== 'production') {
      // en desarrollo, loggea en consola con formato 'dev'
      this.app.use(morgan('dev'));
    } else {
      // en producción, loggea via Winston (archivo + combined)
      this.app.use(
        morgan('combined', {
          stream: {
            write: (msg: string) => logger.info(msg.trim()),
          },
        })
      );
    }

    // CORS
    this.app.use(cors());
  }

  async connectToDatabase(): Promise<void> {
    try {
      await connectDB();
      logger.info('Conectado a la base de datos');
    } catch (error: any) {
      // aquí usamos logger en lugar de console.error
      logger.error('Error al conectar a la base de datos: ' + error.message);
      process.exit(1);
    }
  }

  routes(): void {
    // Middleware de protección
    this.app.use(ipAttackGuard);

    // Ruta raíz
    this.app.get('/', (req: Request, res: Response) => {
      res.send('¡Hola, mundo!');
    });

    // Rutas REST
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
    const port = this.app.get('port');
    this.app.listen(port, () => {
      logger.info(`Servidor escuchando en el puerto ${port}`);
    });
  }
}

const server = new Server();
server.start();
