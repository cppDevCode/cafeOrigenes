import express, { Router } from "express";
import { ReporteRouter } from "./reporte.route.js";
import { ProductoRouter } from "./producto.route.js";
import { PedidoRouter } from "./pedido.routes.js";

export default class Enrutador {
    private router: Router;

    constructor() {
    this.router = express.Router();
    this.RutaEstado();
    this.rutaReporte();
    this.rutaProducto();
    this.rutaPedido();
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

    private rutaProducto() {
        this.router.use("/productos", new ProductoRouter().getRouter());
    }

    private rutaPedido() {
        this.router.use("/pedidos", new PedidoRouter().getRouter());
    }

    public getRoutes() {
        return this.router;
    }
}
