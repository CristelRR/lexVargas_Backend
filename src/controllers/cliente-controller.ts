import { Request, Response } from "express";
import clienteModel from "../models/cliente-model"; // Asegúrate de tener el modelo correspondiente
import logger from "../logger/logger";


class ClienteController {
    async getClientes(req: Request, res: Response) {
        try {
            const clientes = await clienteModel.getClientes();
            res.json(clientes);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            res.status(500).json({ message: 'Error al obtener clientes' });
        }
    }

    async crearCliente(req: Request, res: Response) {
        try {
          const { correo, ...restoDeDatos } = req.body;
      
          // Verificar si el correo ya existe
          const correoExistente = await clienteModel.verificarCorreoExistente(correo);
          if (correoExistente) {
            return res.status(400).json({ message: 'Este correo ya está registrado.' });
          }
      
          // Crear cliente
          await clienteModel.crearCliente(req.body);
      
          // Obtener cliente recién creado
          const clienteCreado = await clienteModel.getClienteByCorreo(correo);
          if (!clienteCreado) {
            return res.status(500).json({ message: 'Cliente creado pero no se pudo recuperar.' });
          }
      
          // Devolver cliente creado
          res.status(201).json(clienteCreado);
        } catch (error) {
          console.error('Error al crear cliente:', error);
          res.status(500).json({ message: 'Error al crear cliente' });
        }
      }
      

    async updateCliente(req: Request, res: Response) {
        try {
            const idCliente = Number(req.params.idCliente); // Obtiene el ID del cliente desde los parámetros de la URL
            if (isNaN(idCliente)) {
                return res.status(400).json({ message: 'ID inválido' });
            }

            const clienteData = req.body; // Obtiene los datos del cliente desde el cuerpo de la solicitud
            await clienteModel.updateCliente(idCliente, clienteData); // Llama al método de actualización en el modelo
            res.json({ message: 'Cliente actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            res.status(500).json({ message: 'Error al actualizar cliente' });
        }
    }

    async deleteCliente(req: Request, res: Response) {
        try {
          const idCliente = Number(req.params.idCliente);
          if (isNaN(idCliente)) {
            return res.status(400).json({ message: 'ID inválido' });
          }
      
          await clienteModel.deleteCliente(idCliente);
          res.json({ message: 'Cliente eliminado exitosamente' });
        } catch (error) {
          console.error('Error al eliminar cliente:', error);
          res.status(500).json({ message: 'Error al eliminar cliente' });
        }
      }
      

    getClienteById = async (req: Request, res: Response) => {
        try {
            const idCliente = Number(req.params.idCliente);
            if (isNaN(idCliente)) {
                return res.status(400).json({ message: 'ID inválido' });
            }
            const cliente = await clienteModel.findById(idCliente); 
            if (cliente.length === 0) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }
            res.status(200).json(cliente[0]); 
        } catch (error) {
            console.error('Error al obtener cliente por ID:', error);
            res.status(500).json({ message: 'Error al obtener cliente' });
        }
    }
    
}

export const clienteController = new ClienteController();
