import { type Request, type Response } from "express";
import { ReporteService } from "../service/reporte.service.js";
import type { MasVendidoResponseDTO } from "../interfaces/reportes.interface.js";

export class ReporteController {
    constructor(private readonly reporteService: ReporteService) {}

    public obtenerFacturacion = async (req: Request, res: Response): Promise<Response | void> => {
        try {
            const total: number = await this.reporteService.obtenerFacturacionTotal();
        
            return res.status(200).json({ total });
        } catch {
            return res.status(500).json({ error: 'No se pudo obtener la facturación' });
        }
    };

    public obtenerMasVendido = async (req: Request, res: Response):Promise<Response | void> => {
        try {
            const producto: MasVendidoResponseDTO | null = await this.reporteService.obtenerMasVendido();

            if (!producto) {
                return res.status(404).json({ error: 'Todavía no hay ventas' });
            }

            return res.status(200).json(producto);
        } catch {
            return res.status(500).json({ error: 'No se pudo obtener el producto más vendido' });
        }
    };
}