import { Request, Response } from "express";
import agendaModel from "../models/agenda-model";
import logger from "../logger/logger";

class AgendaController {
    async getAgendas(req: Request, res: Response) {
        try {
            const agendas = await agendaModel.getAgendas();
            res.json(agendas);
        } catch (error) {
            logger.error('Error al obtener agendas:', error);
            res.status(500).json({ message: 'Error al obtener agendas' });
        }
    }

    async crearAgenda(req: Request, res: Response) {
        try {
            const agendaData = req.body; 
            await agendaModel.crearAgenda(agendaData);
            res.status(201).json({ message: 'Agenda creado exitosamente' });
        } catch (error) {
            logger.error('Error al crear agenda:', error);
            res.status(500).json({ message: 'Error al crear agenda' });
        }
    }

    async updateAgenda(req: Request, res: Response) {
        try {
            const { idAgenda } = req.params; // Obtén el ID del parámetro de la URL
            const agendaData = { ...req.body, idAgenda: Number(idAgenda) }; // Asegúrate de que sea un número
            await agendaModel.updateAgenda(agendaData);
            res.json({ message: 'Agenda actualizado exitosamente' });
        } catch (error) {
            logger.error('Error al actualizar agenda:', error);
            res.status(500).json({ message: 'Error al actualizar agenda' });
        }
    }

    async deleteAgenda(req: Request, res: Response) {
        try {
            const { idAgenda } = req.body; // Asegúrate de validar el ID aquí
            await agendaModel.deleteAgenda(idAgenda);
            res.json({ message: 'Agenda eliminado exitosamente' });
        } catch (error) {
            logger.error('Error al eliminar agenda:', error);
            res.status(500).json({ message: 'Error al eliminar agenda' });
        }
    }
}

export const agendaController = new AgendaController();
