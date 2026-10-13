import { QueryTypes, type Sequelize } from 'sequelize';
import { type FacturacionResponseDTO, type MasVendidoResponseDTO } from '../interfaces/reportes.interface.js'

export class ReporteRepository {
    constructor(private readonly sequelize: Sequelize) {}

    async obtenerFacturacionTotal(): Promise<number> {
        const facturacionTotal: FacturacionResponseDTO[] = await this.sequelize
                                                .query<FacturacionResponseDTO>(
                                                    `SELECT COALESCE(SUM(TOTAL),0)
                                                    FROM
                                                        pedidos
                                                    WHERE
                                                        estado = 'ENTREGADO';`,   
                                                    { type: QueryTypes.SELECT }
                                                );
        return Number(facturacionTotal[0]?.total ?? 0);
    }

    async obtenerMasVendido(): Promise<MasVendidoResponseDTO | null> {
        const masVendido: MasVendidoResponseDTO[] = await this.sequelize
                                                .query<MasVendidoResponseDTO>(
                                                    `SELECT producto_id, nombre, SUM(cantidad) AS cantidadVendida
                                                    FROM
                                                        (items_pedido ip join productos pr
                                                        on ip.producto_id = pr.id) join pedidos p
                                                        on ip.pedido_id = p.id
                                                    WHERE
                                                        p.estado = 'ENTREGADO'
                                                    GROUP BY producto_id, nombre
                                                    ORDER BY cantidadVendida DESC
                                                    LIMIT 1;`,
                                                    { type: QueryTypes.SELECT}
                                                );
        return masVendido[0]?? null;
    }
}