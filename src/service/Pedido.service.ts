import type { Sequelize, OrderItem } from 'sequelize';
import type { CrearPedidoDTO, IItemPedido, IPedido } from '../interfaces/pedido.interface.js';
import type { IProductoRepository } from '../interfaces/producto.interface.js';
import { Pedido } from '../repository/pedido.repository.js';
import { PedidoItemModel, PedidoModel } from '../model/Pedido.model.js';

export class ProductoNoEncontradoError extends Error {
    constructor (public readonly productoId: number) {
        super (`El producto ${productoId} no fue encontrado`);
        this.name = 'ProductoNoEncontradoError';
    }
}

const ordenItems: OrderItem = [{ model: PedidoItemModel, as: 'items' }, 'id', 'ASC'];
const incluirItems= [{model:PedidoItemModel, as: 'items'}];


const aDominio = (p: PedidoModel): IPedido => ({
    id:p.id,
    estado:p.estado,
    total: Number (p.total),
    items: ( p.items?? []).map((i) => ({
        id: i.id,
        productoId: i.productoId,
        cantidad: i.cantidad,
        precioUnitario: Number (i.precioUnitario),
    }))
});

export class PedidoService {
    constructor(
        private readonly productos: IProductoRepository,
        private readonly sequelize: Sequelize,
    ) {}

async armarPedido(dto: CrearPedidoDTO): Promise<Pedido> {
    const items: IItemPedido[] = [];
    for (const { productoId, cantidad } of dto.items) {
        const producto = await this.productos.findById(productoId);
        if (!producto) throw new ProductoNoEncontradoError(productoId);
        items.push({ productoId, cantidad, precioUnitario: producto.calcularPrecio() });
    }
    return new Pedido(items);
}

async crear (dto: CrearPedidoDTO): Promise<IPedido> {
    const pedido = await this.armarPedido(dto);

    //Pedido + items en una sola transacción
    const id = await this.sequelize.transaction(async (t) => {
        const creado = await PedidoModel.create(
            {estado: pedido.estado, total: pedido.total},
            {transaction: t}
        );
        await PedidoItemModel.bulkCreate(
            pedido.items.map((i) => ({
                pedidoId: creado.id,
                productoId: i.productoId,
                cantidad: i.cantidad,
                precioUnitario: i.precioUnitario,
            })),
            {transaction: t}
        );
        return creado.id;
    });

    return (await this.obtener(id)) as IPedido;
}

async listar(): Promise<IPedido[]> {
    const pedidos = await PedidoModel.findAll({
      include: incluirItems,
      order: [['id', 'ASC'], ordenItems],
    });
    return pedidos.map(aDominio);
}

async obtener(id: number): Promise<IPedido | null> {
    const pedido = await PedidoModel.findByPk(id, {
      include: incluirItems,
      order: [ordenItems],
    });
    return pedido ? aDominio(pedido) : null;
}
}