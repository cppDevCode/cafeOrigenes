import express, { Router } from "express";
import { ReporteRouter } from "./reporte.route.js";

export default class Enrutador {
    private router: Router;

    constructor() {
    this.router = express.Router();
    this.RutaEstado();
    this.rutaReporte();
    }

    private RutaEstado() {
        // Ruta de prueba
        this.router.get("/health", (req, res) => {
        res.status(200).json({
            status: "OK",
            message: "API funcionando correctamente",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
        });
        });
    }

    private rutaReporte() {
        this.router.use("/reportes", new ReporteRouter().getRouter());
    }

    public getRoutes() {
        return this.router;
    }
}
