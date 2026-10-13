import { type MasVendidoResponseDTO } from "../interfaces/reportes.interface.js";
import { ReporteRepository } from "../repository/reporte.repository.js";

export class ReporteService {
    constructor(private readonly reporteRepository: ReporteRepository) {
    }

    async obtenerFacturacionTotal(): Promise<number> {
        const total: number = await this.reporteRepository.obtenerFacturacionTotal();

        return total;
    }

    async obtenerMasVendido(): Promise<MasVendidoResponseDTO | null> {
        let masVendido: MasVendidoResponseDTO | null = await this.reporteRepository
                                                        .obtenerMasVendido();

        if (!masVendido) {
            masVendido = null;
        }

        return masVendido;
    }

}
