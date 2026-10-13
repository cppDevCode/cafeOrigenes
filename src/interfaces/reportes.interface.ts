/** GET /reportes/facturacion  -> suma del total de TODOS los pedidos */
export interface FacturacionResponseDTO {
  total: number; // 0 si no hay pedidos
}

/**Cantidad vendida por producto */
export type CantidadVendidaPorProducto = Record<string, number>;

/** GET /reportes/mas-vendido. Sin ventas responde 404 */
export interface MasVendidoResponseDTO {
    productoId: number;
    nombre:string;
    cantidadVendida: number;
}
