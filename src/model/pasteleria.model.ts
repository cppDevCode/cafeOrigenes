import type { IProducto, TipoProducto } from "../interfaces/producto.interface.js";

export class Pasteleria implements IProducto {
    readonly id: number;
    readonly nombre: string;
    readonly tipo: TipoProducto = 'PASTELERIA';
    readonly precioBase: number;

    constructor(id: number, nombre: string, precioBase: number) {
        this.id = id;
        this.nombre = nombre;
        this.precioBase = precioBase;
    }

    calcularPrecio(): number {
        return this.precioBase;
    }
}