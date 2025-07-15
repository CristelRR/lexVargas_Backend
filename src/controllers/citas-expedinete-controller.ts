import { Request, Response } from "express";
import citaExpedienteModel from "../models/cita-expediente-model";
import logger from "../logger/logger";


class CitaExpedienteController {
    async getCitasExpediente(req: Request, res: Response): Promise<Response> {
        const { idExpediente } = req.params; // Obtén el ID del expediente desde los parámetros
        try {
            // Valida que idExpediente sea un número válido
            if (!idExpediente || isNaN(Number(idExpediente))) {
                return res.status(400).json({ message: "ID de expediente inválido." });
            }
    
            const citas = await citaExpedienteModel.getCitasExpediente(Number(idExpediente));
            return res.json(citas); // Asegúrate de retornar la respuesta
        } catch (error) {
            logger.error("Error al obtener citas:", error);
            return res.status(500).json({ message: "Error al obtener citas" }); // Asegúrate de retornar la respuesta
        }
    }
    

    async getExpediente(req: Request, res: Response) {
        try {
            const expediente = await citaExpedienteModel.getExpediente();
            res.json(expediente);
        } catch (error) {
            logger.error('Error al obtener expediente:', error);
            res.status(500).json({ message: 'Error al obtener expediente' });
        }
    }

    async crearCitaExpediente(req: Request, res: Response) {
        try {
            const citaData = req.body; // Asegúrate de validar los datos aquí
            const isCreated = await citaExpedienteModel.crearCitaExpediente(citaData);
            if (isCreated) {
                res.status(201).json({ message: 'Cita creada exitosamente' });
            } else {
                res.status(400).json({ message: 'No se pudo crear la cita' });
            }
        } catch (error) {
            logger.error('Error al crear cita:', error);
            res.status(500).json({ message: 'Error al crear cita' });
        }
    }

    async updateCitaExpediente(req: Request, res: Response) {
        try {
            const citaData = req.body;
            const isUpdated = await citaExpedienteModel.updateCitaExpediente(citaData);
            if (isUpdated) {
                res.json({ message: 'Cita actualizada exitosamente' });
            } else {
                res.status(400).json({ message: 'No se pudo actualizar la cita' });
            }
        } catch (error) {
            logger.error('Error al actualizar cita:', error);
            res.status(500).json({ message: 'Error al actualizar cita' });
        }
    }

    async deleteCitaExpediente(req: Request, res: Response) {
        try {
            const { idCita } = req.body; // Asegúrate de validar el ID aquí
            const isDeleted = await citaExpedienteModel.deleteCitaExpediente(idCita);
            if (isDeleted) {
                res.json({ message: 'Cita eliminada exitosamente' });
            } else {
                res.status(400).json({ message: 'No se pudo eliminar la cita' });
            }
        } catch (error) {
            logger.error('Error al eliminar cita:', error);
            res.status(500).json({ message: 'Error al eliminar cita' });
        }
    }
}

export const citaExpedienteController = new CitaExpedienteController();
