import type { TipoProducto } from '../interfaces/producto.interface.js';
import { Cafe } from './cafe.model.js';

export class CafeFiltrado extends Cafe {
    readonly tipo: TipoProducto = 'CAFE_FILTRADO';
}