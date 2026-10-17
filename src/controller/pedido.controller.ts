import { type Request, type Response } from "express";
import { PedidoService, ProductoNoEncontradoError } from "../service/Pedido.service.js";
import type { IPedido } from "../interfaces/pedido.interface.js";

export class PedidoController {
    constructor(private readonly pedidoService: PedidoService) {}

    public crear = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            const pedido: IPedido = await this.pedidoService.crear(req.body);
            return res.status(201).json(pedido);
        } catch (error) {
            if (error instanceof ProductoNoEncontradoError) {
                return res.status(404).json({ error: error.message });
            }
            console.error('Error al crear pedido:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    public listar = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            const pedidos: IPedido[] = await this.pedidoService.listar();
            return res.status(200).json(pedidos);
        } catch (error) {
            console.error('Error en GET /pedidos:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    public obtenerPorId = async (req: Request, res: Response): Promise<Response | void> => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        try {
            const pedido: IPedido | null = await this.pedidoService.obtener(id);

            if (!pedido) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }

            return res.status(200).json(pedido);
        } catch (error) {
            console.error('Error en GET /pedidos/:id:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    public obtener = this.obtenerPorId;
}

