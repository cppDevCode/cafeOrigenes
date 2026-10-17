import { beforeEach, describe, it, expect, vi, type Mocked } from 'vitest';
import type { IReporteRepository, MasVendidoResponseDTO } from '../interfaces/reportes.interface.js';
import { ReporteService } from '../service/reporte.service.js';

describe('ReporteService', () => {
    let reporteRepository: Mocked<IReporteRepository>;
    let reporteService: ReporteService;

    beforeEach(() => {
        reporteRepository = {
            obtenerFacturacionTotal: vi.fn<() => Promise<number>>(),
            obtenerMasVendido: vi.fn<() => Promise<MasVendidoResponseDTO | null>>(),
        };
        reporteService = new ReporteService(reporteRepository);
    });

    it('obtiene la facturación total desde el repositorio', async () => {
        reporteRepository.obtenerFacturacionTotal.mockResolvedValue(19150);

        await expect(reporteService.obtenerFacturacionTotal()).resolves.toBe(19150);
        expect(reporteRepository.obtenerFacturacionTotal).toHaveBeenCalledOnce();
    });

    it('obtiene el producto más vendido desde el repositorio', async () => {
        const producto: MasVendidoResponseDTO = {
            productoId: 1,
            nombre: 'Café expreso',
            cantidadVendida: 5,
        };
        reporteRepository.obtenerMasVendido.mockResolvedValue(producto);

        await expect(reporteService.obtenerMasVendido()).resolves.toEqual(producto);
        expect(reporteRepository.obtenerMasVendido).toHaveBeenCalledOnce();
    });

    it('retorna null cuando el repositorio no encuentra ventas', async () => {
        reporteRepository.obtenerMasVendido.mockResolvedValue(null);

        await expect(reporteService.obtenerMasVendido()).resolves.toBeNull();
    });
});
