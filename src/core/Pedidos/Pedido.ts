import type { EstadoPedido, IItemPedido, IPedido} from '../../interfaces/pedido.interface.js';

export class Pedido implements IPedido {
    readonly id?: number;
    readonly total: number;

    constructor(
        readonly items: IItemPedido[],
        public estado: EstadoPedido = 'PENDIENTE',
        id?: number,
    ) {
        if (id !== undefined) this.id = id;
        this.total = Pedido.calcularTotal(items);
    }
    


/**Suma precioUnitario x cantidad de cada item */
    static calcularTotal(items: IItemPedido[]): number {
        return items.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
    }
}