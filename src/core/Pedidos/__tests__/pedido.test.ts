import { describe, it, expect } from 'vitest';
import {Pedido} from '../Pedido.js';

describe('Pedido- cálculo del total', () => {
    it('suma precioUnitario * cantidad de todos los ítems', () => {
        const pedido = new Pedido([
            {productoId: 1, cantidad: 2, precioUnitario: 5000},
            {productoId: 2, cantidad: 3, precioUnitario: 2050},
        ]);
        expect(pedido.total).toBe(16150);
    });

    it('multiplica por la cantidad de un único item', () => {
        const pedido = new Pedido([{productoId: 1, cantidad: 3, precioUnitario: 1000}]);
        expect(pedido.total).toBe(3000);
    });
});