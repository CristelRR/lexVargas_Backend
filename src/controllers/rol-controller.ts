import { Request, Response } from "express";
import rolModel from "../models/rol-model";
import logger from "../logger/logger";

class RolController {
    async getRoles(req: Request, res: Response) {
        try {
            const roles = await rolModel.getRoles();
            res.json(roles);
        } catch (error) {
            console.error('Error al obtener roles:', error);
            res.status(500).json({ message: 'Error al obtener roles' });
        }
    }

    async crearRol(req: Request, res: Response) {
        try {
            const rolData = req.body; // Asegúrate de validar los datos aquí
            await rolModel.crearRol(rolData);
            res.status(201).json({ message: 'Rol creado exitosamente' });
        } catch (error) {
            console.error('Error al crear rol:', error);
            res.status(500).json({ message: 'Error al crear rol' });
        }
    }

    async updateRol(req: Request, res: Response) {
        try {
            const rolData = req.body; // Asegúrate de validar los datos aquí
            await rolModel.updateRol(rolData);
            res.json({ message: 'Rol actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar rol:', error);
            res.status(500).json({ message: 'Error al actualizar rol' });
        }
    }

    async deleteRol(req: Request, res: Response) {
        try {
            const { idRol } = req.body; // Asegúrate de validar el ID aquí
            await rolModel.deleteRol(idRol);
            res.json({ message: 'Rol eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar rol:', error);
            res.status(500).json({ message: 'Error al eliminar rol' });
        }
    }
}

export const rolController = new RolController();
