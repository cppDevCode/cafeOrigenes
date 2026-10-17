import express, { Router } from "express";
import { ReporteRepository } from "../repository/reporte.repository.js";
import { ReporteService } from "../service/reporte.service.js";
import { ReporteController } from "../controller/reporte.controller.js";
import { sequelize } from "../config/sequelize.js";
import type { Sequelize } from "sequelize";
import type { IReporteRepository } from "../interfaces/reportes.interface.js";

export class ReporteRouter {
    private router: Router;
    private reporteService: ReporteService;
    private reporteController: ReporteController;

    public constructor(origen: ReporteService | IReporteRepository | Sequelize = sequelize) {
        this.router = express.Router();
        if (origen instanceof ReporteService) {
            this.reporteService = origen;
        } else if ('obtenerFacturacionTotal' in origen && 'obtenerMasVendido' in origen) {
            this.reporteService = new ReporteService(origen as IReporteRepository);
        } else {
            this.reporteService = new ReporteService(new ReporteRepository(origen as Sequelize));
        }
        this.reporteController = new ReporteController(this.reporteService);
        this.rutasReporte();
    }

    private rutasReporte(): void {
        this.router.get("/facturacion", this.reporteController.obtenerFacturacion);
        this.router.get("/mas-vendido", this.reporteController.obtenerMasVendido);
    }

    public getRouter(): Router {
        return this.router;
    }
}

export function createReporteRouter(serviceOrRepo: ReporteService | IReporteRepository = new ReporteService(new ReporteRepository(sequelize))): Router {
    return new ReporteRouter(serviceOrRepo).getRouter();
}
