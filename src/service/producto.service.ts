    import type {
    IProducto,
    IProductoRepository,
    ProductoResponseDTO,
    } from '../interfaces/producto.interface.js';

    function aDTO(p: IProducto): ProductoResponseDTO {
    return {
        id: p.id,
        nombre: p.nombre,
        tipo: p.tipo,
        precioBase: p.precioBase,
        ...(p.tamano !== undefined && { tamano: p.tamano }),
        ...(p.gramos !== undefined && { gramos: p.gramos }),
        ...(p.variedad !== undefined && { variedad: p.variedad }),
        precio: p.calcularPrecio(),
    };
    }

    export class ProductoService {
    constructor(private readonly repo: IProductoRepository) {}

    async listar(): Promise<ProductoResponseDTO[]> {
        const productos = await this.repo.findAll();
        return productos.map(aDTO);
    }

    async obtenerPorId(id: number): Promise<ProductoResponseDTO | null> {
        const producto = await this.repo.findById(id);
        return producto ? aDTO(producto) : null;
    }
    }