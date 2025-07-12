import { Request, Response } from "express";
import { connectDB } from "../config/db";
import logger from "../logger/logger";


class CargarDocumentosController {

    // Método para obtener los expedientes
    async obtenerExpedientes(req: Request, res: Response) {
        try {
            const pool = await connectDB();
            
            // Consulta para obtener los expedientes
            const result = await pool.request().query(`
                SELECT idExpediente, idClienteFK, idEmpleadoFK, numeroExpediente, nombreExpediente
                FROM tblExpediente
                ORDER BY idExpediente DESC
            `);

            res.status(200).json(result.recordset);
        } catch (error) {
            console.error('Error al obtener expedientes:', error);
            res.status(500).json({ error: 'Hubo un error al obtener los expedientes.' });
        }
    }

        async obtenerCategoriasYSubcategorias(req: Request, res: Response) {
            try {
                const pool = await connectDB();

                // Consulta para obtener las categorías y subcategorías
                const result = await pool.request().query(`
                    SELECT 
                        c.idCategoria AS idCategoria,
                        c.nombreCategoria AS nombreCategoria,
                        sc.idSubCategoria AS idSubCategoria,
                        sc.nombreSubCategoria AS nombreSubCategoria
                    FROM tblCategoriasDocumento c
                    LEFT JOIN tblSubCategoriasDocumento sc ON c.idCategoria = sc.idCategoriaFK
                    ORDER BY c.nombreCategoria, sc.nombreSubCategoria
                `);

                // Tipado del objeto de categorías
                interface SubCategoria {
                    idSubCategoria: number;
                    nombreSubCategoria: string;
                }

                interface Categoria {
                    idCategoria: number;
                    nombreCategoria: string;
                    subCategorias: SubCategoria[];
                }

                const categorias: { [key: number]: Categoria } = {};

                // Transformar los datos para que tengan una estructura jerárquica
                result.recordset.forEach((row: any) => {
                    const { idCategoria, nombreCategoria, idSubCategoria, nombreSubCategoria } = row;

                    if (!categorias[idCategoria]) {
                        categorias[idCategoria] = {
                            idCategoria,
                            nombreCategoria,
                            subCategorias: []
                        };
                    }

                    if (idSubCategoria) {
                        categorias[idCategoria].subCategorias.push({
                            idSubCategoria,
                            nombreSubCategoria
                        });
                    }
                });

                // Convertir el objeto en un array para la respuesta
                const categoriasArray = Object.values(categorias);

                res.status(200).json(categoriasArray);
            } catch (error) {
                console.error('Error al obtener categorías y subcategorías:', error);
                res.status(500).json({ error: 'Hubo un error al obtener las categorías y subcategorías.' });
            }
        }
    // Método para obtener solo las subcategorías de una categoría específica
async obtenerSubCategorias(req: Request, res: Response) {
    try {
        const { idCategoria } = req.params; // Obtener el ID de la categoría de los parámetros

        const pool = await connectDB();

        // Consulta para obtener las subcategorías de una categoría específica
        const result = await pool.request()
            .input('idCategoria', idCategoria)
            .query(`
                SELECT 
                    sc.idSubCategoria AS idSubCategoria,
                    sc.nombreSubCategoria AS nombreSubCategoria
                FROM tblSubCategoriasDocumento sc
                WHERE sc.idCategoriaFK = @idCategoria
                ORDER BY sc.nombreSubCategoria
            `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al obtener subcategorías:', error);
        res.status(500).json({ error: 'Hubo un error al obtener las subcategorías.' });
    }
}




async insertarDocumentos(req: Request, res: Response) {
    try {
        const expedienteId = req.body.idExpedienteFK; // ID del expediente seleccionado
        const documentos = req.body.documentos; // Arreglo de documentos en formato JSON

        if (!expedienteId || !documentos || documentos.length === 0) {
            return res.status(400).json({ error: 'ID de expediente y documentos son requeridos' });
        }

        const pool = await connectDB();
        const errores = [];

        // Obtener las categorías y subcategorías válidas de una vez
        const categoriasYSubcategorias = await pool.request().query(`
            SELECT c.idCategoria, sc.idSubCategoria
            FROM tblCategoriasDocumento c
            LEFT JOIN tblSubCategoriasDocumento sc ON c.idCategoria = sc.idCategoriaFK
        `);

        // Crear un set para la validación rápida
        const categoriasValidas = new Set();
        categoriasYSubcategorias.recordset.forEach((row: any) => {
            categoriasValidas.add(`${row.idCategoria}-${row.idSubCategoria}`);
        });

        // Validación de cada documento
        for (const doc of documentos) {
            const { documentoBase64, idCategoriaFK, idSubCategoriaFK } = doc;

            // Validar campos
            if (!documentoBase64 || !idCategoriaFK || !idSubCategoriaFK) {
                errores.push('Cada documento debe incluir Base64, una categoría y una subcategoría.');
                continue;
            }

            // Validar que la categoría y subcategoría son válidas
            if (!categoriasValidas.has(`${idCategoriaFK}-${idSubCategoriaFK}`)) {
                errores.push(`Categoría o subcategoría inválida para documento.`);
                continue;
            }

            // Inserción en la base de datos si todo es válido
            await pool.request()
                .input('idExpedienteFK', expedienteId)
                .input('idCategoriaFK', idCategoriaFK)
                .input('idSubCategoriaFK', idSubCategoriaFK)
                .input('documentoBase64', documentoBase64)
                .query(`
                    INSERT INTO tblDocumentosExpediente (
                        idExpedienteFK, idCategoriaFK, idSubCategoriaFK, documentoBase64, fechaSubida, estado
                    ) VALUES (
                        @idExpedienteFK, @idCategoriaFK, @idSubCategoriaFK, @documentoBase64, GETDATE(), 'pendiente'
                    );
                `);
        }

        if (errores.length > 0) {
            return res.status(400).json({ errors: errores });
        }

        res.status(200).json({ message: 'Documentos subidos exitosamente.' });
    } catch (error) {
        console.error('Error al subir documentos:', error);
        res.status(500).json({ error: 'Hubo un error al procesar los documentos.' });
    }
}

}

export const cargarDocumentosController = new CargarDocumentosController();
