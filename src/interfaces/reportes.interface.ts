/** GET /reportes/facturacion  -> suma del total de TODOS los pedidos */
export interface FacturacionResponseDTO {
  total: number; // 0 si no hay pedidos
}

/**Cantidad vendida por producto */
export type CantidadVendidaPorProducto = Record<string, number>;

/**GET /reportes/mas-vendido */
export interface MasVendidoResponseDTO {
    productoId: number;
    nombre:string;
    cantidadVendida: number;
}

//Sin ventas: GET reportes/mas-vendido -> 404 con ErrorResponseDTO
export interface IReporteRepository {
    facturacionTotal(): Promise<number>;
    cantidadVendidaPorProducto(): Promise<{ productoId: number; nombre: string; cantidadVendida: number }[]>;
}