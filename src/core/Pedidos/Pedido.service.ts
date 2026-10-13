import type { CrearPedidoDTO, IItemPedido, IPedido, IPedidoRepository } from '../../interfaces/pedido.interface.js';
import type { IProductoRepository } from '../../interfaces/producto.interface.js';
import { Pedido } from './Pedidos.js';

export class ProductoNoEncontradoError extends Error {
    constructor (public readonly productoID: number) {
        super (`El producto ${productoID} no fue encontrado`);
        this.name = 'ProductoNoEncontradoError';
    }
}


export class PedidoService {
    constructor(
        private readonly productos: IProductoRepository,
        private readonly pedidos: IPedidoRepository,
    ) {}

async crear (dto: CrearPedidoDTO): Promise<IPedido> {
    const items: IItemPedido[] = [];
    for (const { productoId, cantidad} of dto.items) {
        const producto = await this.productos.findById(productoId);
        if (!producto) throw new ProductoNoEncontradoError(productoId);
        items.push({ productoId, cantidad, precioUnitario: producto.calcularPrecio() });
    }
    return this.pedidos.guardar(new Pedido(items));
}

listar(): Promise<IPedido[]> {
    return this.pedidos.findAll();
}

obtener(id: number): Promise<IPedido | null> {
    return this.pedidos.findById(id);
}
}