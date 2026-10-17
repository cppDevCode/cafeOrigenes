import { type Request, type Response } from "express";
import { ProductoService } from "../service/producto.service.js";
import type { ProductoResponseDTO } from "../interfaces/producto.interface.js";

export class ProductoController {
    constructor(private readonly productoService: ProductoService) {}

    public listar = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            const productos: ProductoResponseDTO[] = await this.productoService.listar();

            return res.status(200).json(productos);
        } catch {
            return res.status(500).json({ error: 'No se pudieron obtener los productos' });
        }
    };

    public obtenerPorId = async (req: Request, res: Response): Promise<Response | void> => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'El id debe ser un número entero positivo' });
        }

        try {
            const producto: ProductoResponseDTO | null = await this.productoService.obtenerPorId(id);

            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            return res.status(200).json(producto);
        } catch {
            return res.status(500).json({ error: 'No se pudo obtener el producto' });
        }
    };
}