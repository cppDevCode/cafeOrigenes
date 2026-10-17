import express, { Router } from "express";
import { ProductoRepository } from "../repository/producto.repository.js";
import { ProductoService } from "../service/producto.service.js";
import { ProductoController } from "../controller/producto.controller.js";
import { sequelize } from "../config/BaseDeDatos.js";

export class ProductoRouter {
    private router: Router;
    private productoRepository: ProductoRepository = new ProductoRepository(sequelize);
    private productoService: ProductoService = new ProductoService(this.productoRepository);
    private productoController: ProductoController = new ProductoController(this.productoService);

    public constructor() {
        this.router = express.Router();
        this.rutasProducto();
    }

    private rutasProducto(): void {
        this.router.get("/", this.productoController.listar);
        this.router.get("/:id", this.productoController.obtenerPorId);
    }

    public getRouter(): Router {
        return this.router;
    }
}