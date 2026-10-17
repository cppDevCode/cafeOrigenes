import { sequelize } from '../config/BaseDeDatos.js';
import type { TamanoCafe, VariedadCafe } from '../interfaces/producto.interface.js';

interface ProductoSeed {
  nombre: string;
  tipo: string;
  precioBase: number;
  tamano: TamanoCafe | null;
  gramos: number | null;
  variedad: VariedadCafe | null;
}

const MAQUINAS = [
  {
    tipo: 'CAFE_EXPRESO',
    etiqueta: 'Expreso',
    precioBase: 2500,
    gramos: { POCILLO: 18, MEDIANO: 27, TAZA_GRANDE: 36 } as Record<TamanoCafe, number>,
  },
  {
    tipo: 'CAFE_FILTRADO',
    etiqueta: 'Filtrado',
    precioBase: 3200,
    gramos: { POCILLO: 6, MEDIANO: 15, TAZA_GRANDE: 25 } as Record<TamanoCafe, number>,
  },
];
const VARIEDADES: VariedadCafe[] = ['BRASIL', 'COLOMBIA', 'ETIOPIA'];

// "TAZA_GRANDE" -> "Taza grande"
const legible = (s: string) =>
  s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ');

const cafes: ProductoSeed[] = MAQUINAS.flatMap((m) =>
  (Object.entries(m.gramos) as [TamanoCafe, number][]).flatMap(([tamano, gramos]) =>
    VARIEDADES.map((variedad) => ({
      nombre: `${m.etiqueta} ${legible(tamano)} ${legible(variedad)}`,
      tipo: m.tipo,
      precioBase: m.precioBase,
      tamano,
      gramos,
      variedad,
    })),
  ),
);

const pasteleria: ProductoSeed[] = [
  { nombre: 'Muffin de chocolate', tipo: 'PASTELERIA', precioBase: 2500, tamano: null, gramos: null, variedad: null },
  { nombre: 'Porción de torta selva negra', tipo: 'PASTELERIA', precioBase: 4200, tamano: null, gramos: null, variedad: null },
];

async function sembrar() {
  try {
    await sequelize.authenticate();
    for (const p of [...cafes, ...pasteleria]) {
      await sequelize.query(
        `INSERT INTO productos (nombre, tipo, precio_base, tamano, gramos, variedad)
         VALUES (:nombre, :tipo, :precioBase, :tamano, :gramos, :variedad)
         ON CONFLICT (nombre) DO NOTHING`,
        { replacements: { ...p } },
      );
    }
    const [filas] = await sequelize.query('SELECT COUNT(*) AS total FROM productos');
    console.log('Productos en la base:', filas);
  } catch (error) {
    console.error('Error al sembrar:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

sembrar();