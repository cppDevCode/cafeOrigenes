export type TipoProducto = 'CAFE_EXPRESO'| 'CAFE_FILTRADO'| 'PASTELERIA';
export type VariedadCafe= 'BRASIL'| 'COLOMBIA'| 'ETIOPIA';
export type TamanoCafe= 'POCILLO'| 'MEDIANO'| 'TAZA_GRANDE';


export interface IProducto {
    readonly id: number;
    readonly nombre: string;
    readonly tipo: TipoProducto;
    readonly precioBase: number;
    readonly tamano?: TamanoCafe;
    readonly gramos?: number;
    readonly variedad?: VariedadCafe;
    calcularPrecio(): number;
}

export interface IProductoRepository {
    findById(id: number): Promise<IProducto | null>;
    findAll(): Promise<IProducto[]>;
}

export interface ProductoResponseDTO {
    id: number;
    nombre: string;
    tipo: TipoProducto;
    precioBase: number;
    tamano?: TamanoCafe;
    gramos?: number;
    variedad?: VariedadCafe;
    precio: number; //Resultado de calcularPrecio()
}
