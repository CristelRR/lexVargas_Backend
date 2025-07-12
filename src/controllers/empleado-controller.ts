import { Request, Response } from "express";
import empleadoModel from "../models/empleado-model";
import logger from "../logger/logger";

class EmpleadoController {
    async getEmpleados(req: Request, res: Response) {
        try {
            const empleados = await empleadoModel.getEmpleados();
            res.json(empleados);
        } catch (error) {
            console.error('Error al obtener empleados:', error);
            res.status(500).json({ message: 'Error al obtener empleados' });
        }
    }

    getEmpleadoById = async (req: Request, res: Response) => { // Usando la sintaxis de propiedad
        try {
            const idEmpleado = Number(req.params.idEmpleado);
            if (isNaN(idEmpleado)) {
                return res.status(400).json({ message: 'ID inválido' });
            }
            const empleado = await empleadoModel.getEmpleadoById(idEmpleado);
            if (!empleado) {
                return res.status(404).json({ message: 'Empleado no encontrado' });
            }
            res.status(200).json(empleado);
        } catch (error) {
            console.error('Error al obtener empleado por ID:', error);
            res.status(500).json({ message: 'Error al obtener empleado' });
        }
    }
    
    async getAbogados(req: Request, res: Response) {
        try {
            const empleados = await empleadoModel.getAbogados();
            res.json(empleados);
        } catch (error) {
            console.error('Error al obtener abogados:', error);
            res.status(500).json({ message: 'Error al obtener abogados' });
        }
    }

    async crearEmpleado(req: Request, res: Response) {
        try {
            const empleadoData = req.body; 
            await empleadoModel.crearEmpleado(empleadoData);
            res.status(201).json({ message: 'Empleado creado exitosamente' });
        } catch (error) {
            console.error('Error al crear empleado:', error);
            res.status(500).json({ message: 'Error al crear empleado' });
        }
    }

    async updateEmpleado(req: Request, res: Response) {
        try {
            const idEmpleado = Number(req.params.idEmpleado); // Obtén el ID del parámetro de la URL
            if (isNaN(idEmpleado)) {
                return res.status(400).json({ message: 'ID inválido' });
            }

            const empleadoData = req.body; // Datos editables del empleado
            await empleadoModel.updateEmpleado(idEmpleado, empleadoData); 
            res.json({ message: 'Empleado actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
            res.status(500).json({ message: 'Error al actualizar empleado' });
        }
    }

    async deleteEmpleado(req: Request, res: Response) {
        try {
            const { idEmpleado } = req.body; // Asegúrate de validar el ID aquí
            await empleadoModel.deleteEmpleado(idEmpleado);
            res.json({ message: 'Empleado eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            res.status(500).json({ message: 'Error al eliminar empleado' });
        }
    }
}

export const empleadoController = new EmpleadoController();
