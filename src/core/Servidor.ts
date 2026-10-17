import "reflect-metadata";
import { type Application } from "express";
import Enrutador from '../routes/index.route.js'
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { sequelize } from "../config/BaseDeDatos.js";
import { initPedidoModels } from "../model/Pedido.model.js";
import { migrar } from "../migrations/raw.js";
import { sembrar150Datos } from "../migrations/seed.js";
//Clase Servidor
export class Servidor {
  private enrutador: Enrutador = new Enrutador();
  private app: Application;
  private port: string;
  /*Metodo Constructor que mediante el metodo dotenv vuelca los datos de las
  variables de entorno del archivo .env en el process.env, luego genera una 
  instancia de express en el atributo app, guarda el puerto en el port y va 
  llamando los metodos privados de Middleware, rutas, errores y el saludo de 
  finalizacion de ejecución.
  */
  public constructor() {
    dotenv.config();
    this.app = express();
    this.port = process.env.PUERTO || "3001";
    this.middleware();
    this.rutas();
    this.errores();
    this.saludo();
  }

  private middleware() {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
      }),
    );
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));
    // Logging
    if (process.env.NODE_ENV !== "test") {
      this.app.use(morgan("combined"));
    }
  }

  private rutas() {    
    this.app.use("/api", this.enrutador.getRoutes());
    // Health check en la raíz
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Módulo de Pedidos
    initPedidoModels(sequelize);
    
    
    // Manejo de rutas no encontradas (sin "*")
    this.app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
    });
  }

  private errores() {
    
  }

  /*Metodo Publico que levanta la api al ser llamado (ojo primero tiene que
  ser instanciada la clase Servidor)*/
  public startServer = async (): Promise<void> => {
    try {
      // Probar conexión a la base de datos
      //await sequelize.authenticate();
      console.log("Coneccion Establecida");

      // Ejecutar migraciones si las tablas no existen (usando raw.ts)
      await migrar(false);
      await sembrar150Datos();
      console.log("Base de datos Sincronizada");

      this.app.listen(this.port, () => {
        console.log(`Esta corriendo la api en el puerto: ${this.port}`);
        console.log(`Entorno: ${process.env.NODE_ENV || "development"}`);
        console.log(`API corriendo en: http://localhost:${this.port}/api`);
      });
    } catch (error) {
      console.error("No se pudo conectar con el servidor", error);
      // Continuar sin base de datos para desarrollo
      this.app.listen(this.port, () => {
        console.log(`Continuamos sin la base de datos conectada ${this.port}`);
      });
    }
  };

  private saludo() {
    // Manejo de cierre graceful
    process.on("SIGTERM", async () => {
      console.log("SIGTERM recibida!");
      try {
        //await sequelize.close();
      } catch (error) {
        console.error("Error closing database:", error);
      }
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("SIGINT recibida");
      try {
        //await sequelize.close();
      } catch (error) {
        console.error("Error closing database:", error);
      }
      process.exit(0);
    });
  }
}
