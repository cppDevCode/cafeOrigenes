import { describe, it, expect } from 'vitest';
import type { IProducto } from '../interfaces/producto.interface.js';
import { CafeExpreso } from '../model/cafeExpreso.model.js';
import { CafeFiltrado } from '../model/cafeFiltrado.model.js';
import { Pasteleria } from '../model/pasteleria.model.js';


const casos: [string, IProducto, number][] = [
    // Expreso (precioBase 2500)
    ['Expreso Pocillo Brasil',       new CafeExpreso(1,  'Expreso Pocillo Brasil',       2500, 'POCILLO',     18, 'BRASIL'),   5020],
    ['Expreso Pocillo Colombia',     new CafeExpreso(2,  'Expreso Pocillo Colombia',     2500, 'POCILLO',     18, 'COLOMBIA'), 5740],
    ['Expreso Pocillo Etiopia',      new CafeExpreso(3,  'Expreso Pocillo Etiopia',      2500, 'POCILLO',     18, 'ETIOPIA'),  6820],
    ['Expreso Mediano Brasil',       new CafeExpreso(4,  'Expreso Mediano Brasil',       2500, 'MEDIANO',     27, 'BRASIL'),   6280],
    ['Expreso Mediano Colombia',     new CafeExpreso(5,  'Expreso Mediano Colombia',     2500, 'MEDIANO',     27, 'COLOMBIA'), 7360],
    ['Expreso Mediano Etiopia',      new CafeExpreso(6,  'Expreso Mediano Etiopia',      2500, 'MEDIANO',     27, 'ETIOPIA'),  8980],
    ['Expreso Taza grande Brasil',   new CafeExpreso(7,  'Expreso Taza grande Brasil',   2500, 'TAZA_GRANDE', 36, 'BRASIL'),   7540],
    ['Expreso Taza grande Colombia', new CafeExpreso(8,  'Expreso Taza grande Colombia', 2500, 'TAZA_GRANDE', 36, 'COLOMBIA'), 8980],
    ['Expreso Taza grande Etiopia',  new CafeExpreso(9,  'Expreso Taza grande Etiopia',  2500, 'TAZA_GRANDE', 36, 'ETIOPIA'),  11140],

    // Filtrado (precioBase 3200)
    ['Filtrado Pocillo Brasil',       new CafeFiltrado(10, 'Filtrado Pocillo Brasil',       3200, 'POCILLO',     6,  'BRASIL'),   4040],
    ['Filtrado Pocillo Colombia',     new CafeFiltrado(11, 'Filtrado Pocillo Colombia',     3200, 'POCILLO',     6,  'COLOMBIA'), 4280],
    ['Filtrado Pocillo Etiopia',      new CafeFiltrado(12, 'Filtrado Pocillo Etiopia',      3200, 'POCILLO',     6,  'ETIOPIA'),  4640],
    ['Filtrado Mediano Brasil',       new CafeFiltrado(13, 'Filtrado Mediano Brasil',       3200, 'MEDIANO',     15, 'BRASIL'),   5300],
    ['Filtrado Mediano Colombia',     new CafeFiltrado(14, 'Filtrado Mediano Colombia',     3200, 'MEDIANO',     15, 'COLOMBIA'), 5900],
    ['Filtrado Mediano Etiopia',      new CafeFiltrado(15, 'Filtrado Mediano Etiopia',      3200, 'MEDIANO',     15, 'ETIOPIA'),  6800],
    ['Filtrado Taza grande Brasil',   new CafeFiltrado(16, 'Filtrado Taza grande Brasil',   3200, 'TAZA_GRANDE', 25, 'BRASIL'),   6700],
    ['Filtrado Taza grande Colombia', new CafeFiltrado(17, 'Filtrado Taza grande Colombia', 3200, 'TAZA_GRANDE', 25, 'COLOMBIA'), 7700],
    ['Filtrado Taza grande Etiopia',  new CafeFiltrado(18, 'Filtrado Taza grande Etiopia',  3200, 'TAZA_GRANDE', 25, 'ETIOPIA'),  9200],

    // Pastelería (el precio final es el precioBase)
    ['Muffin de chocolate',         new Pasteleria(19, 'Muffin de chocolate',         2500), 2500],
    ['Porción de torta selva negra', new Pasteleria(20, 'Porción de torta selva negra', 4200), 4200],
    ];

    describe('Producto - calcularPrecio()', () => {
    it.each(casos)('%s devuelve el precio final de la tabla', (_nombre, producto, esperado) => {
        expect(producto.calcularPrecio()).toBe(esperado);
    });

    it('un café distinto de la pastelería no devuelve solo el precioBase', () => {
        const cafe = new CafeExpreso(1, 'Expreso Pocillo Brasil', 2500, 'POCILLO', 18, 'BRASIL');
        expect(cafe.calcularPrecio()).not.toBe(cafe.precioBase);
    });
    });