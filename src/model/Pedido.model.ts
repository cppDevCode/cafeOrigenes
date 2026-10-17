import {DataTypes, Model, type Sequelize} from 'sequelize';
import type {EstadoPedido} from '../interfaces/pedido.interface.js';

export class PedidoItemModel extends Model {
    declare id: number;
    declare pedidoId: number;
    declare productoId: number;
    declare cantidad: number;
    declare precioUnitario: string; // pg devuelve decimal como string
}

export class PedidoModel extends Model {
    declare id: number;
    declare estado: EstadoPedido;
    declare total: string; // pg devuelve decimal como string
    declare items?: PedidoItemModel[];
}

/**Llama una vez al iniciar la app, pasando la instancia de Sequelize  */
export function initPedidoModels(sequelize: Sequelize): void {
    PedidoModel.init({
        id:{ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PENDIENTE' },
        total: {type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {sequelize, tableName: 'pedidos', timestamps: false},
    );

    PedidoItemModel.init({
        id:{ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        pedidoId: { type: DataTypes.INTEGER, allowNull: false },
        productoId: { type: DataTypes.INTEGER, allowNull: false },
        cantidad: { type: DataTypes.INTEGER, allowNull: false },
        precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {sequelize, tableName: 'pedido_items', timestamps: false, underscored: true},
    );

    PedidoModel.hasMany(PedidoItemModel, {foreignKey: 'pedidoId', as: 'items'});
    PedidoItemModel.belongsTo(PedidoModel, {foreignKey: 'pedidoId'});

    }


