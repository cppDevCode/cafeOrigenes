# ☕ Café Orígenes - API REST

API REST integral para la gestión y administración de **Café Orígenes**, cafetería de especialidad y pastelería artesanal. El sistema modela el catálogo de productos con cálculo polimórfico de precios, orquestación de pedidos con transacciones atómicas, emisión de reportes analíticos de facturación y ventas, bajo una arquitectura modular limpia, pruebas automatizadas en todos los niveles (unitarias, integración y End-to-End) y soporte para despliegue contenerizado con Docker.

---

## 👥 Integrantes del Equipo

* **Alejandro Lucas Baldres**
* **Julieta Dabús**
* **Marianela Belardinelli**

---

## 📖 Descripción del Proyecto y Reglas de Negocio

### Dominio y Catálogo de Productos
El sistema comercializa dos familias principales de productos:
1. **Cafés (`CAFE_EXPRESO` y `CAFE_FILTRADO`)**:
   - Cuentan con un **tamaño** (`POCILLO`, `MEDIANO`, `TAZA_GRANDE`), una dosificación en **gramos** y una **variedad de grano** de origen (`BRASIL`, `COLOMBIA`, `ETIOPIA`).
   - Poseen un costo por gramo de acuerdo con el origen:
     - 🇧🇷 **Brasil**: \$140 / gramo
     - 🇨🇴 **Colombia**: \$180 / gramo
     - 🇪🇹 **Etiopía**: \$240 / gramo
   - **Fórmula de cálculo de precio**:
     $$\text{Precio} = \text{precioBase} + (\text{gramos} \times \text{precioPorGramo}[\text{variedad}])$$
2. **Pastelería Artesanal (`PASTELERIA`)**:
   - Productos como medialunas, croissants, tartas, alfajores y cheesecake.
   - No poseen atributos de tamaño, gramos ni variedad.
   - **Fórmula de cálculo de precio**:
     $$\text{Precio} = \text{precioBase}$$

### Ciclo de Vida de los Pedidos
- Cada pedido se inicia automáticamente en estado `PENDIENTE`.
- Los estados válidos del pedido son: `PENDIENTE`, `EN_PREPARACION`, `ENTREGADO` y `CANCELADO`.
- Al crear una orden se valida la existencia de cada ítem en el catálogo y se calcula en el momento el `precioUnitario` exacto, guardando el total consolidado de forma transaccional (ACID) en la base de datos PostgreSQL.

### Métricas y Reportes de Negocio
- **Facturación total**: Suma acumulada del importe total de todos los pedidos efectivamente `ENTREGADO`s.
- **Producto más vendido**: Identifica el producto con mayor cantidad de unidades acumuladas en pedidos completados (`ENTREGADO`).

### Seguridad y Resiliencia
- Encabezados de protección HTTP mediante **Helmet** (prevención de ataques XSS, MIME sniffing, Clickjacking).
- Soporte configurado para políticas de **CORS** seguras.
- Registro de solicitudes HTTP en consola con **Morgan**.
- Cierre graceful (`SIGINT` / `SIGTERM`).

---

## 🛠️ Dependencias y Requerimientos

### Requerimientos Previos del Sistema
- **Node.js**: versión `20.x` o superior (probado y compatible con `Node 24 LTS`).
- **Gestor de paquetes**: [`pnpm`](https://pnpm.io/) (versión 9+ o habilitado con `corepack enable`) o alternativamente `npm`.
- **PostgreSQL**: versión `16+` (obligatorio para ejecución local sin Docker).
- **Docker & Docker Compose**: versión moderna de Docker Engine / Docker Desktop (si se opta por despliegue contenerizado).

### Dependencias Principales de Producción (`dependencies`)
- **`express` (^5.3.0)**: Framework web HTTP minimalista y robusto.
- **`sequelize` (^6.37.8)**: ORM relacional para modelado de datos, transacciones y consultas tipadas.
- **`pg` (^8.23.1)** & **`pg-hstore`**: Driver y serializador nativo para PostgreSQL.
- **`dotenv` (^18.0.7)**: Carga dinámica de variables de entorno desde `.env`.
- **`helmet` (^8.3.0)**: Middleware de seguridad para cabeceras HTTP.
- **`cors` (^2.8.6)**: Habilitación y configuración de Cross-Origin Resource Sharing.
- **`morgan` (^1.12.1)**: Logger HTTP para trazabilidad de peticiones.
- **`reflect-metadata` (^0.2.2)**: Soporte de metadatos para TypeScript.

### Dependencias de Desarrollo y Testing (`devDependencies`)
- **`typescript`**: Compilador y tipado estático estricto.
- **`tsx`**: Ejecutor ágil de TypeScript para desarrollo y scripts CLI.
- **`vitest`**: Test runner ultra veloz para pruebas unitarias y de integración.
- **`supertest`**: Simulación de llamadas HTTP a la API Express en tests de integración.
- **`@playwright/test`**: Suite de pruebas End-to-End (E2E) para validar el flujo completo del cliente y contratos de red.
- **`eslint`** & **`typescript-eslint`**: Herramientas de análisis de código estático y estilos.
- **`husky`** & **`lint-staged`**: Automatización de hooks pre-commit en Git.
- **`cross-env`**: Manejo unificado de variables de entorno entre sistemas operativos.

---

## 📂 Estructura del Proyecto

El proyecto implementa una arquitectura en capas desacoplada (Clean Architecture / Repository Pattern) donde cada componente posee una única responsabilidad:

```text
cafeOrigenes/
├── .env.example             # Plantilla de variables de entorno requeridas
├── compose.yml              # Orquestación de contenedores Docker Compose
├── Dockerfile               # Construcción multi-stage optimizada de producción
├── eslint.config.js         # Configuración del linter ESLint
├── package.json             # Manifiesto de scripts y dependencias
├── playwright.config.ts     # Configuración de pruebas End-to-End Playwright
├── tsconfig.json            # Configuración de compilación TypeScript
├── vitest.config.ts         # Configuración del runner de pruebas Vitest
│
├── e2e/                     # Suite de pruebas End-to-End (Playwright)
│   ├── flujo-compra.spec.ts # Flujo completo de negocio: catálogo -> pedido -> persistencia
│   ├── health.spec.ts       # Disponibilidad, estado de salud y rutas 404
│   ├── pedidos.spec.ts      # Contratos, creación y validaciones de pedidos
│   ├── productos.spec.ts    # Listado, detalle y cálculo polimórfico de precios
│   ├── reportes.spec.ts     # Métricas de facturación y producto más vendido
│   └── seguridad.spec.ts    # Verificación de cabeceras Helmet y CORS
│
└── src/                     # Código fuente de la aplicación
    ├── app.ts               # Punto de entrada de la aplicación
    ├── config/              # Configuraciones de infraestructura
    │   ├── BaseDeDatos.ts   # Conexión Sequelize y pool por entorno (dev/test/prod)
    │   └── sequelize.ts     # Instancia activa de Sequelize
    ├── controller/          # Capa de controladores HTTP (adaptadores de entrada)
    │   ├── pedido.controller.ts
    │   ├── producto.controller.ts
    │   └── reporte.controller.ts
    ├── core/                # Inicialización y ciclo de vida del servidor
    │   └── Servidor.ts      # Middlewares, registro de rutas, migraciones y seed
    ├── interfaces/          # Tipos, contratos y Data Transfer Objects (DTOs)
    │   ├── dbConfig.interface.ts
    │   ├── pedido.interface.ts
    │   ├── producto.interface.ts
    │   └── reportes.interface.ts
    ├── migrations/          # Gestión de esquemas y datos iniciales
    │   ├── raw.ts           # DDL SQL: tablas con constraints y vistas
    │   └── seed.ts          # Sembrado del catálogo y 150 pedidos de prueba
    ├── model/               # Modelos de dominio y entidades Sequelize
    │   ├── cafe.model.ts    # Clase abstracta Café con cálculo por gramo
    │   ├── cafeExpreso.model.ts
    │   ├── cafeFiltrado.model.ts
    │   ├── pasteleria.model.ts
    │   └── Pedido.model.ts  # Modelos Sequelize para Pedidos y PedidoItems
    ├── repository/          # Capa de persistencia y acceso a datos
    │   ├── pedido.repository.ts
    │   ├── producto.repository.ts
    │   └── reporte.repository.ts
    ├── routes/              # Declaración de routers Express
    │   ├── index.route.ts   # Enrutador principal (/api y /health)
    │   ├── pedido.routes.ts
    │   ├── producto.route.ts
    │   └── reporte.route.ts
    ├── service/             # Capa de lógica de negocio y casos de uso
    │   ├── Pedido.service.ts
    │   ├── producto.service.ts
    │   └── reporte.service.ts
    ├── utils/               # Utilidades y constantes del negocio
    │   └── precioPorGramo.utils.ts # Tabulación de precios por gramo de café
    └── __test__/            # Tests unitarios y de integración (Vitest + Supertest)
        ├── pedido.integration.test.ts
        ├── pedido.service.test.ts
        ├── pedido.test.ts
        ├── producto.integration.test.ts
        ├── producto.test.ts
        ├── reporte.integration.test.ts
        └── reporte.service.test.ts
```

---

## ⚙️ Configuración de Variables de Entorno

Antes de iniciar la aplicación (con o sin Docker), configura tu archivo `.env` en la raíz del proyecto:

```env
# Servidor HTTP
PUERTO=3002
CORS_ORIGIN=http://localhost:3002

# Base de Datos PostgreSQL
DB_USER=origenes
DB_PASSWORD=cafe
DB_NAME=cafe_origenes
DB_HOST=localhost
DB_PORT=5433
```

> **Aclaración sobre `DB_HOST` y `DB_PORT`:**
> - **Sin Docker**: `DB_HOST=localhost` y `DB_PORT=5433` (o el puerto donde corra tu PostgreSQL local).
> - **Con Docker**: En el archivo `compose.yml`, el backend se enlaza al servicio `postgres` en la red interna, y el puerto expuesto al host es el definido en `${DB_PORT}:5432`.

---

## 🚀 Despliegue y Ejecución

### Opción A: Despliegue con Docker (Recomendado)

La aplicación cuenta con un archivo `compose.yml` y un `Dockerfile` multi-stage optimizado que gestiona tanto el backend en Node 24 como la base de datos PostgreSQL 16 Alpine con verificación de salud (*healthcheck*), límites de CPU/memoria y persistencia mediante volúmenes.

#### 1. Iniciar los contenedores
Ejecuta el siguiente comando en la raíz del repositorio:
```bash
docker compose up --build -d
```

#### 2. ¿Qué ocurre internamente al iniciar?
1. Se levanta el contenedor `cafe_postgres` con PostgreSQL 16 Alpine y volumen `pgdata`.
2. El contenedor ejecuta un healthcheck periódico (`pg_isready`).
3. Al estar PostgreSQL listo, se inicia el contenedor `backend`.
4. El servidor ejecuta automáticamente las migraciones DDL (`raw.ts`) y el sembrado inicial (`seed.ts`), insertando el catálogo de productos y **150 pedidos simulados** para disponibilizar datos inmediatos en los endpoints de reportes.
5. La API queda escuchando en `http://localhost:3002`.

#### 3. Ver logs en tiempo real
```bash
docker compose logs -f backend
```

#### 4. Detener el entorno
```bash
# Detener contenedores conservando los datos de PostgreSQL
docker compose down

# Detener contenedores eliminando el volumen de datos
docker compose down -v
```

---

### Opción B: Despliegue sin Docker (Local / Servidor Bare-Metal)

#### 1. Requisitos previos
- Disponer de un servidor PostgreSQL 16+ activo.
- Crear la base de datos:
  ```sql
  CREATE DATABASE cafe_origenes;
  ```

#### 2. Instalar dependencias
```bash
# Habilitar pnpm si no está instalado globalmente
corepack enable

# Instalar dependencias del proyecto
pnpm install
```

#### 3. Configurar `.env`
Crea el archivo `.env` con las credenciales de tu PostgreSQL local:
```env
PUERTO=3002
CORS_ORIGIN=http://localhost:3002
DB_USER=origenes
DB_PASSWORD=cafe
DB_NAME=cafe_origenes
DB_HOST=localhost
DB_PORT=5433
```

#### 4. Migración y sembrado de datos (Opcional manual)
*Nota: El servidor ejecuta las migraciones y el seed automáticamente al arrancar, pero puedes dispararlos manualmente por CLI:*
```bash
# Ejecutar migración de tablas y vistas DDL
pnpm migrar

# Sembrar catálogo inicial y 150 pedidos de prueba
pnpm seed
```

#### 5. Ejecutar la aplicación

**Modo Desarrollo (con hot-reload y recarga automática):**
```bash
pnpm dev
```

**Modo Producción (compilación a JavaScript estándar):**
```bash
# Compilar TypeScript a dist/
pnpm build

# Iniciar servidor compilado
pnpm start
```

---

## 🧪 Ejecución de Pruebas y Calidad de Código

El proyecto posee una cobertura integral mediante suites de pruebas automatizadas:

```bash
# Ejecutar tests unitarios y de integración con Vitest (47 tests)
pnpm test

# Ejecutar tests End-to-End (E2E) con Playwright
pnpm test:e2e

# Ejecutar tests E2E con interfaz gráfica interactiva
pnpm test:e2e:ui

# Visualizar el reporte HTML de Playwright
pnpm test:e2e:report

# Analizar la calidad de código y linter
pnpm lint
```

---

## 📡 Endpoints de la API y Ejemplos con `cURL`

> La URL base de la aplicación es: `http://localhost:3002`

---

### 1. Health Checks (Estado del Servidor)

#### `GET /health`
Verifica la disponibilidad general del servicio, uptime y marca de tiempo.

* **cURL:**
  ```bash
  curl -X GET http://localhost:3002/health
  ```
* **Respuesta (200 OK):**
  ```json
  {
    "status": "OK",
    "timestamp": "2026-10-17T18:40:00.000Z",
    "uptime": 12.458
  }
  ```

#### `GET /api/health`
Health check dentro del prefijo `/api` indicando el entorno activo.

* **cURL:**
  ```bash
  curl -X GET http://localhost:3002/api/health
  ```
* **Respuesta (200 OK):**
  ```json
  {
    "status": "OK",
    "message": "API funcionando correctamente",
    "timestamp": "2026-10-17T18:40:00.000Z",
    "environment": "development"
  }
  ```

---

### 2. Módulo de Productos

#### `GET /api/productos`
Retorna el catálogo completo de cafés y pastelería con su precio final calculado en tiempo real según la variedad y gramaje.

* **cURL:**
  ```bash
  curl -X GET http://localhost:3002/api/productos
  ```
* **Respuesta (200 OK):**
  ```json
  [
    {
      "id": 1,
      "nombre": "Café Expreso Pocillo (Colombia)",
      "tipo": "CAFE_EXPRESO",
      "precioBase": 2500,
      "tamano": "POCILLO",
      "gramos": 10,
      "variedad": "COLOMBIA",
      "precio": 4300
    },
    {
      "id": 2,
      "nombre": "Café Expreso Mediano (Brasil)",
      "tipo": "CAFE_EXPRESO",
      "precioBase": 3200,
      "tamano": "MEDIANO",
      "gramos": 15,
      "variedad": "BRASIL",
      "precio": 5300
    },
    {
      "id": 6,
      "nombre": "Medialuna de Manteca",
      "tipo": "PASTELERIA",
      "precioBase": 1200,
      "precio": 1200
    }
  ]
  ```

#### `GET /api/productos/:id`
Retorna el detalle de un producto específico por su ID numérico.

* **cURL (Café existente):**
  ```bash
  curl -X GET http://localhost:3002/api/productos/1
  ```
* **Respuesta (200 OK):**
  ```json
  {
    "id": 1,
    "nombre": "Café Expreso Pocillo (Colombia)",
    "tipo": "CAFE_EXPRESO",
    "precioBase": 2500,
    "tamano": "POCILLO",
    "gramos": 10,
    "variedad": "COLOMBIA",
    "precio": 4300
  }
  ```

* **cURL (Pastelería existente):**
  ```bash
  curl -X GET http://localhost:3002/api/productos/6
  ```
* **Respuesta (200 OK):**
  ```json
  {
    "id": 6,
    "nombre": "Medialuna de Manteca",
    "tipo": "PASTELERIA",
    "precioBase": 1200,
    "precio": 1200
  }
  ```

* **cURL (Error 404 - Producto no encontrado):**
  ```bash
  curl -X GET http://localhost:3002/api/productos/99999
  ```
* **Respuesta (404 Not Found):**
  ```json
  {
    "error": "Producto no encontrado"
  }
  ```

* **cURL (Error 400 - ID inválido):**
  ```bash
  curl -X GET http://localhost:3002/api/productos/invalido
  ```
* **Respuesta (400 Bad Request):**
  ```json
  {
    "error": "El id debe ser un número entero positivo"
  }
  ```

---

### 3. Módulo de Pedidos

#### `POST /api/pedidos`
Crea una nueva orden de compra indicando una lista de ítems (`productoId` y `cantidad`). El sistema valida la existencia de cada producto, calcula el precio unitario exacto y totaliza la orden transaccionalmente.

* **cURL (Pedido mixto café + pastelería):**
  ```bash
  curl -X POST http://localhost:3002/api/pedidos \
    -H "Content-Type: application/json" \
    -d '{
      "items": [
        { "productoId": 1, "cantidad": 1 },
        { "productoId": 6, "cantidad": 3 }
      ]
    }'
  ```
* **Respuesta (201 Created):**
  ```json
  {
    "id": 151,
    "estado": "PENDIENTE",
    "total": 7900,
    "items": [
      {
        "id": 312,
        "productoId": 1,
        "cantidad": 1,
        "precioUnitario": 4300
      },
      {
        "id": 313,
        "productoId": 6,
        "cantidad": 3,
        "precioUnitario": 1200
      }
    ]
  }
  ```

* **cURL (Error 404 - Producto inexistente en el ítem):**
  ```bash
  curl -X POST http://localhost:3002/api/pedidos \
    -H "Content-Type: application/json" \
    -d '{
      "items": [
        { "productoId": 999999, "cantidad": 1 }
      ]
    }'
  ```
* **Respuesta (404 Not Found):**
  ```json
  {
    "error": "El producto 999999 no fue encontrado"
  }
  ```

#### `GET /api/pedidos`
Obtiene la lista completa de todos los pedidos registrados en el sistema, ordenados por ID con sus respectivos ítems desglosados.

* **cURL:**
  ```bash
  curl -X GET http://localhost:3002/api/pedidos
  ```
* **Respuesta (200 OK):**
  ```json
  [
    {
      "id": 1,
      "estado": "ENTREGADO",
      "total": 5700,
      "items": [
        {
          "id": 1,
          "productoId": 1,
          "cantidad": 1,
          "precioUnitario": 2500
        },
        {
          "id": 2,
          "productoId": 8,
          "cantidad": 1,
          "precioUnitario": 3500
        }
      ]
    },
    {
      "id": 2,
      "estado": "PENDIENTE",
      "total": 2400,
      "items": [
        {
          "id": 3,
          "productoId": 6,
          "cantidad": 2,
          "precioUnitario": 1200
        }
      ]
    }
  ]
  ```

#### `GET /api/pedidos/:id`
Obtiene el detalle y estado de un pedido particular por su ID.

* **cURL:**
  ```bash
  curl -X GET http://localhost:3002/api/pedidos/1
  ```
* **Respuesta (200 OK):**
  ```json
  {
    "id": 1,
    "estado": "ENTREGADO",
    "total": 5700,
    "items": [
      {
        "id": 1,
        "productoId": 1,
        "cantidad": 1,
        "precioUnitario": 2500
      },
      {
        "id": 2,
        "productoId": 8,
        "cantidad": 1,
        "precioUnitario": 3500
      }
    ]
  }
  ```

* **cURL (Error 404 - Pedido inexistente):**
  ```bash
  curl -X GET http://localhost:3002/api/pedidos/999999
  ```
* **Respuesta (404 Not Found):**
  ```json
  {
    "error": "Pedido no encontrado"
  }
  ```

---

### 4. Módulo de Reportes

#### `GET /api/reportes/facturacion`
Calcula y devuelve la suma total de dinero facturado de todos los pedidos completados (`estado = 'ENTREGADO'`).

* **cURL:**
  ```bash
  curl -X GET http://localhost:3002/api/reportes/facturacion
  ```
* **Respuesta (200 OK):**
  ```json
  {
    "total": 1395400
  }
  ```

#### `GET /api/reportes/mas-vendido`
Identifica el producto con mayor volumen de unidades vendidas considerando únicamente pedidos `ENTREGADO`s.

* **cURL:**
  ```bash
  curl -X GET http://localhost:3002/api/reportes/mas-vendido
  ```
* **Respuesta (200 OK):**
  ```json
  {
    "productoId": 9,
    "nombre": "Cheesecake de Frutos Rojos",
    "cantidadVendida": 64
  }
  ```

* **Respuesta cuando aún no existen ventas entregadas (404 Not Found):**
  ```json
  {
    "error": "Todavía no hay ventas"
  }
  ```

---

## 🔒 Buenas Prácticas y Seguridad Implementadas

- **Transacciones ACID**: La persistencia de pedidos y sus ítems se efectúa bajo bloques transaccionales en Sequelize, garantizando integridad referencial y atomicidad ante cualquier imprevisto.
- **Constraints a Nivel de Base de Datos**: Integridad mediante constraints `CHECK` en SQL para validar coherencia entre cafés (tamaño, gramos y variedad obligatorios) y pastelería (sin atributos de café).
- **Protección de Cabeceras**: Integración de **Helmet** con políticas estrictas de contenido y aislamiento de frames.
- **CORS Configurable**: Restricción de orígenes permitidos configurable desde variables de entorno.
- **Testing Continuo**: Suite con 47 tests unitarios y de integración con Vitest y Supertest, más tests End-to-End con Playwright para verificar casos positivos, negativos y edge cases.

