import { type IReporteRepository, type MasVendidoResponseDTO } from "../interfaces/reportes.interface.js";

export class ReporteService {
    constructor(private readonly reporteRepository: IReporteRepository) {
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
