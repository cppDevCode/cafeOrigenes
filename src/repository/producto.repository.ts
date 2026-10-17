import { QueryTypes, type Sequelize } from 'sequelize';
import type {
    IProducto,
    IProductoRepository,
    TamanoCafe,
    TipoProducto,
    VariedadCafe,
} from '../interfaces/producto.interface.js';
import { CafeExpreso } from '../model/cafeExpreso.model.js';
import { CafeFiltrado } from '../model/cafeFiltrado.model.js';
import { Pasteleria } from '../model/pasteleria.model.js';

interface ProductoRow {
    id: number;
    nombre: string;
    tipo: TipoProducto;
    precio_base: number;
    tamano: TamanoCafe | null;
    gramos: number | null;
    variedad: VariedadCafe | null;
}

const COLUMNAS = 'id, nombre, tipo, precio_base, tamano, gramos, variedad';

// El CHECK de la base garantiza que en un café tamano, gramos y variedad no son NULL,
// por eso los "!" son seguros.
function filaAProducto(f: ProductoRow): IProducto {
    switch (f.tipo) {
        case 'CAFE_EXPRESO':
            return new CafeExpreso(f.id, f.nombre, f.precio_base, f.tamano!, f.gramos!, f.variedad!);
        case 'CAFE_FILTRADO':
            return new CafeFiltrado(f.id, f.nombre, f.precio_base, f.tamano!, f.gramos!, f.variedad!);
        case 'PASTELERIA':
            return new Pasteleria(f.id, f.nombre, f.precio_base);
        default:
            throw new Error(`Tipo de producto desconocido: ${String(f.tipo)}`);
    }
}

export class ProductoRepository implements IProductoRepository {
    constructor(private readonly sequelize: Sequelize) {}

    async findAll(): Promise<IProducto[]> {
        const filas = await this.sequelize.query<ProductoRow>(
        `SELECT ${COLUMNAS} FROM productos ORDER BY id`,
        { type: QueryTypes.SELECT },
        );
        return filas.map(filaAProducto);
    }

    async findById(id: number): Promise<IProducto | null> {
        const filas = await this.sequelize.query<ProductoRow>(
        `SELECT ${COLUMNAS} FROM productos WHERE id = :id`,
        { type: QueryTypes.SELECT, replacements: { id } },
        );
        const fila = filas[0];
        return fila ? filaAProducto(fila) : null;
    }
}