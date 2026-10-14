import type {
    IProducto,
    TipoProducto,
    TamanoCafe,
    VariedadCafe
} from '../interfaces/producto.interface.js';
import { PRECIO_POR_GRAMO } from './precioPorGramo.js';

export class CafeFiltrado implements IProducto {
    readonly id: number;
    readonly nombre: string;
    readonly tipo: TipoProducto = 'CAFE_FILTRADO';
    readonly precioBase: number;
    readonly tamano: TamanoCafe;
    readonly gramos: number;
    readonly variedad: VariedadCafe;

    constructor(
        id: number,
        nombre: string,
        precioBase: number,
        tamano: TamanoCafe,
        gramos: number,
        variedad: VariedadCafe
    ) {
        this.id = id;
        this.nombre = nombre;
        this.precioBase = precioBase;
        this.tamano = tamano;
        this.gramos = gramos;
        this.variedad = variedad;
    }


calcularPrecio(): number {
    const costoCafe= this.gramos * PRECIO_POR_GRAMO[this.variedad];
    return this.precioBase + costoCafe;
}   
}