import type {
    IProducto,
    TipoProducto,
    TamanoCafe,
    VariedadCafe,
} from '../interfaces/producto.interface.js';
import { PRECIO_POR_GRAMO } from '../utils/precioPorGramo.utils.js';

export abstract class Cafe implements IProducto {
    abstract readonly tipo: TipoProducto;

    constructor(
        readonly id: number,
        readonly nombre: string,
        readonly precioBase: number,
        readonly tamano: TamanoCafe,
        readonly gramos: number,
        readonly variedad: VariedadCafe,
    ) {}

    calcularPrecio(): number {
        const costoCafe = this.gramos * PRECIO_POR_GRAMO[this.variedad];
        return costoCafe + this.precioBase;
    }
}