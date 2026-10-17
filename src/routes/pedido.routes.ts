import express, { Router } from 'express';
import { PedidoRepository } from '../repository/pedido.repository.js';
import { PedidoService, ProductoNoEncontradoError } from '../service/Pedido.service.js';
import { PedidoController } from '../controller/pedido.controller.js';
import { ProductoRepository } from '../repository/producto.repository.js';
import { sequelize } from '../config/BaseDeDatos.js';
import type { Sequelize } from 'sequelize';
import type { IPedidoRepository } from '../interfaces/pedido.interface.js';


export class PedidoRouter {
    private router: Router;
    private pedidoService: PedidoService;
    private pedidoController: PedidoController;

    public constructor(origen: PedidoService | IPedidoRepository | Sequelize = sequelize) {
        this.router = express.Router();
        if (origen instanceof PedidoService) {
            this.pedidoService = origen;
        } else if ('guardar' in origen || 'findAll' in origen || 'findById' in origen) {
            const productoRepository = new ProductoRepository(sequelize);
            this.pedidoService = new PedidoService(productoRepository, origen as IPedidoRepository);
        } else {
            const seq = (origen as Sequelize) ?? sequelize;
            const productoRepository = new ProductoRepository(seq);
            const pedidoRepository = new PedidoRepository(seq);
            this.pedidoService = new PedidoService(productoRepository, pedidoRepository);
        }
        this.pedidoController = new PedidoController(this.pedidoService);
        this.rutasPedido();
    }

    private rutasPedido(): void {
        this.router.post('/', this.pedidoController.crear);
        this.router.get('/', this.pedidoController.listar);
        this.router.get('/:id', this.pedidoController.obtenerPorId);
    }

    public getRouter(): Router {
        return this.router;
    }
}

export function createPedidoRouter(
    serviceOrRepo: PedidoService | IPedidoRepository | Sequelize = sequelize,
): Router {
    return new PedidoRouter(serviceOrRepo).getRouter();
}

export { ProductoNoEncontradoError };