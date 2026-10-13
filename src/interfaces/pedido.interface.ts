export type EstadoPedido= 'PENDIENTE' | 'EN_PREPARACION'| 'ENTREGADO';

export interface ItemPedido {
    id?: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
}

export interface IPedido {
    id?: number;
    items: ItemPedido[];
    estado: EstadoPedido;  // se crea siempre como 'PENDIENTE'
    total: number;
}

export interface IPedidoRepository {
    guardar(pedido: Omit<IPedido, 'id'>): Promise<IPedido>;
    findById(id: number): Promise<IPedido | null>;
    findAll(): Promise<IPedido[]>;
}

// DTOs HTTP

/**POST /pedidos */
export interface CrearPedidoDTO {
    items: { productoId: number; cantidad: number}[];
}

/** Respues de POST/pedidos, GET/pedidos y GET/pedididos/:id */
export interface PedidoResponseDTO {
    id: number;
    estado: EstadoPedido;
    total: number;
    items:{id: number; productoId:number; cantidad: number; precioUnitario: number}[];
}
