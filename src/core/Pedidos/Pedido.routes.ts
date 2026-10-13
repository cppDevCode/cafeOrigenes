import { Router } from 'express';
import { type PedidoService, ProductoNoEncontradoError } from './Pedido.service.js';

export function createPedidoRouter(service: PedidoService): Router {
    const router = Router();

    //POST/pedidos
    router.post('/', async (req, res) => {
        try {
            const pedido= await service.crear(req.body)
            res.status(201).json(pedido);
        } catch (error) {
            if (error instanceof ProductoNoEncontradoError) {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    //GET/pedidos
    router.get('/', async (req, res) => {
        try {
            res.json(await service.listar());
        } catch {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    //GET/pedidos/:id
    router.get('/:id', async (req, res) => {
        try {
            const id = Number(req.params.id);
            const pedido = Number.isInteger(id) ? await service.obtener(id) : null;
            if (!pedido) {
                res.status(404).json({ error: 'Pedido no encontrado' });
                return;
            }
            res.json(pedido);
        } catch {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
    return router;
}