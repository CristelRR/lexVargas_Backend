import { Request, Response } from "express";
import especialidadModel from "../models/especialidad-model";
import logger from "../logger/logger";

class EspecialidadController {
    async getEspecialidades(req: Request, res: Response) {
        try {
            const especialidades = await especialidadModel.getEspecialidades();
            res.json(especialidades);
        } catch (error) {
            console.error('Error al obtener especialidades:', error);
            res.status(500).json({ message: 'Error al obtener especialidades' });
        }
    }

    async crearEspecialidad(req: Request, res: Response) {
        try {
            const especialidadData = req.body; // Asegúrate de validar los datos aquí
            await especialidadModel.crearEspecialidad(especialidadData);
            res.status(201).json({ message: 'Especialidad creada exitosamente' });
        } catch (error) {
            console.error('Error al crear especialidad:', error);
            res.status(500).json({ message: 'Error al crear especialidad' });
        }
    }

    async updateEspecialidad(req: Request, res: Response) {
        try {
            const especialidadData = req.body; // Asegúrate de validar los datos aquí
            await especialidadModel.updateEspecialidad(especialidadData);
            res.json({ message: 'Especialidad actualizada exitosamente' });
        } catch (error) {
            console.error('Error al actualizar especialidad:', error);
            res.status(500).json({ message: 'Error al actualizar especialidad' });
        }
    }

    async deleteEspecialidad(req: Request, res: Response) {
        try {
            const { idEspecialidad } = req.body; // Asegúrate de validar el ID aquí
            await especialidadModel.deleteEspecialidad(idEspecialidad);
            res.json({ message: 'Especialidad eliminada exitosamente' });
        } catch (error) {
            console.error('Error al eliminar especialidad:', error);
            res.status(500).json({ message: 'Error al eliminar especialidad' });
        }
    }
}

export const especialidadController = new EspecialidadController();
