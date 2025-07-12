import { Request, Response } from "express";
import expedienteNModel from "../models/expediente-model";
import logger from "../logger/logger";


class ExpedienteNController {
    async getExpedientes(req: Request, res: Response) {
        try {
            const expedientes = await expedienteNModel.getExpedientes();
            res.json(expedientes);
        } catch (error) {
            console.error('Error al obtener expedientes:', error);
            res.status(500).json({ message: 'Error al obtener expedientes' });
        }
    }

    async crearExpediente(req: Request, res: Response) {
        try {
            const expedienteData = req.body; // Asegúrate de validar los datos aquí
            await expedienteNModel.crearExpediente(expedienteData);
            res.status(201).json({ message: 'Expediente creada exitosamente' });
        } catch (error) {
            console.error('Error al crear expediente:', error);
            res.status(500).json({ message: 'Error al crear expediente' });
        }
    }

    async updateExpediente(req: Request, res: Response) {
        try {
            const expedienteData = req.body; // Asegúrate de validar los datos aquí
            await expedienteNModel.updateExpediente(expedienteData);
            res.json({ message: 'Expediente actualizada exitosamente' });
        } catch (error) {
            console.error('Error al actualizar expediente:', error);
            res.status(500).json({ message: 'Error al actualizar expediente' });
        }
    }

    async deleteExpediente(req: Request, res: Response) {
        try {
            const { idExpediente } = req.body; // Asegúrate de validar el ID aquí
            await expedienteNModel.deleteExpediente(idExpediente);
            res.json({ message: 'Expediente eliminada exitosamente' });
        } catch (error) {
            console.error('Error al eliminar expediente:', error);
            res.status(500).json({ message: 'Error al eliminar expediente' });
        }
    }

    // Método findById agregado
    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params; // Cambié a req.params porque típicamente el ID viene en la URL
            const expediente = await expedienteNModel.findById(parseInt(id));
            if (!expediente) {
                return res.status(404).json({ message: 'Expediente no encontrado' });
            }
            res.json(expediente);
        } catch (error) {
            console.error('Error al obtener expediente:', error);
            res.status(500).json({ message: 'Error al obtener expediente' });
        }
    }

    //MÈTODO INFORMACIÒN GENERAL POR NUMERO DE EXPEDIENTE
    async informacionGeneral(req: Request, res: Response) {
        try {
            const { idExpediente } = req.params; // Obtener el número de expediente de los parámetros de la URL

            if (!idExpediente) {
                return res.status(400).json({ message: "El número de expediente es requerido" });
            }

            const expediente = await expedienteNModel.informacionGeneral(idExpediente);

            if (!expediente) {
                return res.status(404).json({ message: "Expediente no encontrado" });
            }

            res.json(expediente); // Enviar el expediente como respuesta
        } catch (error) {
            console.error("Error al obtener la información general del expediente:", error);
            res.status(500).json({ message: "Error al obtener la información general del expediente" });
        }
    }

    
    async obtenerPartes(req: Request, res: Response) {
      try {
        const { idExpediente } = req.params;
        if (!idExpediente) {
          return res.status(400).json({ message: 'El número de expediente es requerido.' });
        }
    
        const partes = await expedienteNModel.getPartesPorExpediente(idExpediente);
    
        // Verifica que partes es un arreglo antes de usar .filter
        if (!Array.isArray(partes)) {
          return res.status(500).json({ message: 'Error: El resultado no es una lista de partes válida.' });
        }
    
        const response = {
          demandantes: partes.filter(p => p.tipoParte === 'Demandante'),
          demandados: partes.filter(p => p.tipoParte === 'Demandado'),
          terceros: partes.filter(p => p.tipoParte === 'Tercero')
        };
    
        res.json(response);
      } catch (error) {
        console.error('Error al obtener las partes del expediente:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
      }
    }
    

      async agregarParte(req: Request, res: Response) {
        try {
          const { tipoParte, parteData } = req.body;
      
          if (!tipoParte || !parteData) {
            return res.status(400).json({ message: 'Tipo de parte y datos son requeridos.' });
          }
      
          let result;
          switch (tipoParte) {
            case 'Demandante':
              result = await expedienteNModel.agregarParteDemandante(parteData);
              break;
            case 'Demandado':
              result = await expedienteNModel.agregarParteDemandada(parteData);
              break;
            case 'Tercero':
              result = await expedienteNModel.agregarTerceroRelacionado(parteData);
              break;
            default:
              return res.status(400).json({ message: 'Tipo de parte no válido.' });
          }
      
          res.status(201).json({ 
            message: 'Parte agregada exitosamente.', 
            parte: result 
          });
        } catch (error) {
          console.error('Error al agregar parte:', error);
          res.status(500).json({ message: 'Error interno del servidor.' });
        }
      }
    


}

export const expedienteNController = new ExpedienteNController();
