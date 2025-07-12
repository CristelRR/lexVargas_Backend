import { Request, Response } from "express";
import notaModel from "../models/nota-modal";
import logger from "../logger/logger";

class NotaController {
    /**
     * Obtener todas las notas
     */
    async getNotas(req: Request, res: Response) {
        try {
            const notas = await notaModel.getNotas();
            res.json(notas);
        } catch (error) {
            console.error('Error al obtener notas:', error);
            res.status(500).json({ message: 'Error al obtener notas' });
        }
    }

    /**
     * Obtener notas por cita o expediente
     */
    async getNotasPorCitaOExpediente(req: Request, res: Response) {
        try {
            const { idCita, idExpediente } = req.query;
            if (!idCita && !idExpediente) {
                return res.status(400).json({ message: 'Debe proporcionar un ID de cita o expediente' });
            }

            const notas = await notaModel.getNotasPorCitaOExpediente(
                idCita ? Number(idCita) : null,
                idExpediente ? Number(idExpediente) : null
            );
            res.json(notas);
        } catch (error) {
            console.error('Error al obtener notas:', error);
            res.status(500).json({ message: 'Error al obtener notas' });
        }
    }

    /**
     * Crear una nueva nota
     */
    async crearNota(req: Request, res: Response) {
        try {
          const { titulo, descripcion, tipoNota, idCitaFK, idExpedienteFK } = req.body;
      
          if (!titulo || !descripcion || !tipoNota || !idCitaFK || !idExpedienteFK) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
          }
      
          const nuevaNota = {
            titulo,
            descripcion,
            tipoNota,
            idCitaFK,
            idExpedienteFK,
            fechaCreacion: new Date(),
            ultimaActualizacion: new Date(),
            estado: 'activa',
          };
      
          await notaModel.crearNota(nuevaNota); // Llama al modelo para guardar la nota
          res.status(201).json({ message: 'Nota creada exitosamente' });
        } catch (error) {
          console.error('Error al crear nota:', error);
          res.status(500).json({ message: 'Error al crear nota' });
        }
      }
            

    /**
     * Actualizar una nota existente
     */
    async updateNota(req: Request, res: Response) {
        try {
            const notaData = req.body; // Asegúrate de validar los datos aquí
            if (!notaData.idNota) {
                return res.status(400).json({ message: 'El ID de la nota es obligatorio' });
            }

            await notaModel.updateNota(notaData);
            res.json({ message: 'Nota actualizada exitosamente' });
        } catch (error) {
            console.error('Error al actualizar nota:', error);
            res.status(500).json({ message: 'Error al actualizar nota' });
        }
    }

    /**
     * Eliminar una nota
     */
    async deleteNota(req: Request, res: Response) {
        try {
            const { idNota } = req.body; // Asegúrate de validar el ID aquí
            if (!idNota) {
                return res.status(400).json({ message: 'El ID de la nota es obligatorio' });
            }

            await notaModel.deleteNota(Number(idNota));
            res.json({ message: 'Nota eliminada exitosamente' });
        } catch (error) {
            console.error('Error al eliminar nota:', error);
            res.status(500).json({ message: 'Error al eliminar nota' });
        }
    }

    /**
     * Obtener una nota por su ID
     */
    async getNotaById(req: Request, res: Response) {
        try {
            const { idNota } = req.params;
            if (!idNota) {
                return res.status(400).json({ message: 'El ID de la nota es obligatorio' });
            }

            const nota = await notaModel.findById(Number(idNota));
            if (!nota.length) {
                return res.status(404).json({ message: 'Nota no encontrada' });
            }

            res.json(nota[0]);
        } catch (error) {
            console.error('Error al obtener la nota:', error);
            res.status(500).json({ message: 'Error al obtener la nota' });
        }
    }

    /**
 * Obtener notas por ID de la cita
 */
async getNotasPorCita(req: Request, res: Response) {
    try {
        const { idCita } = req.params; // Se espera que el ID de la cita venga como parámetro de ruta
        if (!idCita) {
            return res.status(400).json({ message: 'El ID de la cita es obligatorio' });
        }

        const notas = await notaModel.findNotasByCitaId(Number(idCita));
        if (!notas.length) {
            return res.status(404).json({ message: 'No se encontraron notas para la cita proporcionada' });
        }

        res.json(notas);
    } catch (error) {
        console.error('Error al obtener notas por cita:', error);
        res.status(500).json({ message: 'Error al obtener notas por cita' });
    }
}

}

export const notaController = new NotaController();
