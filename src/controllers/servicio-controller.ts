import { Request, Response } from "express";
import servicioModel from "../models/servicio-model";
import logger from "../logger/logger";

class ServicioController {
    async getServicios(req: Request, res: Response) {
        try {
            const servicios = await servicioModel.getServicios();
            res.json(servicios);
        } catch (error) {
            logger.error('Error al obtener servicios:', error);
            res.status(500).json({ message: 'Error al obtener servicios' });
        }
    }

    async crearServicio(req: Request, res: Response) {
        try {
            const servicioData = req.body; // Asegúrate de validar los datos aquí
            await servicioModel.crearServicio(servicioData);
            res.status(201).json({ message: 'Servicio creado exitosamente' });
        } catch (error) {
            logger.error('Error al crear servicio:', error);
            res.status(500).json({ message: 'Error al crear servicio' });
        }
    }

    async updateServicio(req: Request, res: Response) {
        try {
            const servicioData = req.body; // Asegúrate de validar los datos aquí
            await servicioModel.updateServicio(servicioData);
            res.json({ message: 'Servicio actualizado exitosamente' });
        } catch (error) {
            logger.error('Error al actualizar servicio:', error);
            res.status(500).json({ message: 'Error al actualizar servicio' });
        }
    }

    async deleteServicio(req: Request, res: Response) {
        try {
            const { idServicio } = req.body; // Asegúrate de validar el ID aquí
            await servicioModel.deleteServicio(idServicio);
            res.json({ message: 'Servicio eliminado exitosamente' });
        } catch (error) {
            logger.error('Error al eliminar servicio:', error);
            res.status(500).json({ message: 'Error al eliminar servicio' });
        }
    }

    // Método para obtener servicios de un abogado específico
    async getServiciosPorAbogado(req: Request, res: Response) {
        try {
            const idAbogado = parseInt(req.params.idAbogado, 10);
            if (isNaN(idAbogado)) {
                return res.status(400).json({ message: 'ID de abogado inválido' });
            }

            const servicios = await servicioModel.getServiciosPorAbogado(idAbogado);
            res.json(servicios);
        } catch (error) {
            logger.error('Error al obtener servicios por abogado:', error);
            res.status(500).json({ message: 'Error al obtener servicios por abogado' });
        }
    }

}

export const servicioController = new ServicioController();
