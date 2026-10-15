import express, { Router } from "express";
import { ReporteRepository } from "../repository/reporte.repository.js";
import { ReporteService } from "../service/reporte.service.js";
import { ReporteController } from "../controller/reporte.controller.js";
import { sequelize } from "../config/sequelize.js";

export class ReporteRouter {
    private router: Router;
    private reporteRepository: ReporteRepository = new ReporteRepository(sequelize);
    private reporteService: ReporteService = new ReporteService(this.reporteRepository);
    private reporteController: ReporteController = new ReporteController(this.reporteService);

    public constructor() {
        this.router = express.Router();
        this.rutasReporte();
    }

    private rutasReporte(): void {
        this.router.get("/facturacion",this.reporteController.obtenerFacturacion);
        this.router.get("/mas-vendido", this.reporteController.obtenerMasVendido);
    }

    public getRouter(): Router {
        return this.router;
    }
}
