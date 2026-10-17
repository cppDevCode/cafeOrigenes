import type { OrderItem, Sequelize } from 'sequelize';
import type { EstadoPedido, IItemPedido, IPedido, IPedidoRepository } from '../interfaces/pedido.interface.js';
import { PedidoItemModel, PedidoModel } from '../model/Pedido.model.js';

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

    /** Suma precioUnitario x cantidad de cada item */
    static calcularTotal(items: IItemPedido[]): number {
        return items.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
    }
}

const ordenItems: OrderItem = [{ model: PedidoItemModel, as: 'items' }, 'id', 'ASC'];
const incluirItems = [{ model: PedidoItemModel, as: 'items' }];

const aDominio = (p: PedidoModel): IPedido => ({
    id: p.id,
    estado: p.estado,
    total: Number(p.total),
    items: (p.items ?? []).map((i) => ({
        id: i.id,
        productoId: i.productoId,
        cantidad: i.cantidad,
        precioUnitario: Number(i.precioUnitario),
    })),
});

export class PedidoRepository implements IPedidoRepository {
    constructor(private readonly sequelize: Sequelize) {}

    async guardar(pedido: IPedido): Promise<IPedido> {
        const id = await this.sequelize.transaction(async (t) => {
            const creado = await PedidoModel.create(
                { estado: pedido.estado, total: pedido.total },
                { transaction: t },
            );
            await PedidoItemModel.bulkCreate(
                pedido.items.map((i) => ({
                    pedidoId: creado.id,
                    productoId: i.productoId,
                    cantidad: i.cantidad,
                    precioUnitario: i.precioUnitario,
                })),
                { transaction: t },
            );
            return creado.id;
        });

        const pedidoGuardado = await this.findById(id);
        return pedidoGuardado!;
    }

    async findAll(): Promise<IPedido[]> {
        const pedidos = await PedidoModel.findAll({
            include: incluirItems,
            order: [['id', 'ASC'], ordenItems],
        });
        return pedidos.map(aDominio);
    }

    async findById(id: number): Promise<IPedido | null> {
        const pedido = await PedidoModel.findByPk(id, {
            include: incluirItems,
            order: [ordenItems],
        });
        return pedido ? aDominio(pedido) : null;
    }

    public crear = this.guardar;
    public listar = this.findAll;
    public obtener = this.findById;
}