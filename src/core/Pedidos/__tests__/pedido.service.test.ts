import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest';
import type { Sequelize } from 'sequelize';
import { PedidoService, ProductoNoEncontradoError } from '../Pedido.service.js';
import type { IProducto, IProductoRepository } from '../../../interfaces/producto.interface.js';
 
//Producto de prueba
//precioBase es distinto del precio final para comprobar que se usa calcularPrecio()
const productoStub = (id: number, precio: number): IProducto => ({
  id,
  nombre: `Producto ${id}`,
  tipo: 'PASTELERIA',
  precioBase: 1,
  calcularPrecio: () => precio,
});
 
describe('PedidoService.armarPedido', () => {
  let service: PedidoService;
 
  beforeEach(() => {
    const catalogo = new Map<number, IProducto>([
      [1, productoStub(1, 5020)],
      [2, productoStub(2, 2500)],
    ]);
    const productos: Mocked<IProductoRepository> = {
        findById: vi.fn(async (id: number) => catalogo.get(id) ?? null),
        findAll: vi.fn(),
        };
    
    service = new PedidoService(productos, {} as Sequelize);
  });
 
  it('calcula el total usando calcularPrecio() * cantidad', async () => {
    const pedido = await service.armarPedido({
      items: [
        { productoId: 1, cantidad: 2 },
        { productoId: 2, cantidad: 1 },
      ],
    });
 
    expect(pedido.total).toBe(12540);
    expect(pedido.estado).toBe('PENDIENTE');
    expect(pedido.items[0]).toEqual({ productoId: 1, cantidad: 2, precioUnitario: 5020 });
  });
 
  it('falla si un producto no existe', async () => {
    await expect(
      service.armarPedido({ items: [{ productoId: 99, cantidad: 1 }] }),
    ).rejects.toBeInstanceOf(ProductoNoEncontradoError);
  });
});