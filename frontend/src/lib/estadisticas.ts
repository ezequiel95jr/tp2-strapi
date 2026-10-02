import type { Categoria, IncidenteResumen } from "./types";

export type Rango = "hoy" | "semana" | "dia" | "mes" | "anio";

export const RANGOS: { valor: Rango; texto: string }[] = [
  { valor: "hoy", texto: "Hoy" },
  { valor: "semana", texto: "Últimos 7 días" },
  { valor: "dia", texto: "Un día" },
  { valor: "mes", texto: "Mes" },
  { valor: "anio", texto: "Año" },
];

export const esRango = (valor?: string): valor is Rango =>
  RANGOS.some((r) => r.valor === valor);

export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// Hora de Argentina (UTC-3, sin horario de verano desde 2009). Las fechas se
// guardan en UTC; para agrupar por día u hora hay que hacerlo en hora local.
const DESFASE_MS = -3 * 60 * 60 * 1000;
const HORA_MS = 60 * 60 * 1000;
const DIA_MS = 24 * HORA_MS;

const local = (ms: number) => new Date(ms + DESFASE_MS);
const desdeLocal = (anio: number, mes: number, dia = 1, hora = 0) =>
  Date.UTC(anio, mes, dia, hora) - DESFASE_MS;
const dosCifras = (n: number) => String(n).padStart(2, "0");

export type Cubeta = { etiqueta: string; desde: number; hasta: number };

export type Periodo = {
  rango: Rango;
  titulo: string;
  desde: number;
  hasta: number;
  cubetas: Cubeta[];
  // Valores elegidos, para mostrarlos en los filtros
  fecha: string; // YYYY-MM-DD
  mes: string; // YYYY-MM
  anio: number;
};

export type ParametrosRango = {
  rango?: string;
  fecha?: string;
  mes?: string;
  anio?: string;
};

function porHoras(anio: number, mes: number, dia: number): Cubeta[] {
  return Array.from({ length: 24 }, (_, h) => ({
    etiqueta: `${dosCifras(h)} h`,
    desde: desdeLocal(anio, mes, dia, h),
    hasta: desdeLocal(anio, mes, dia, h + 1),
  }));
}

function porDias(inicio: number, cantidad: number, etiqueta: (d: Date) => string): Cubeta[] {
  return Array.from({ length: cantidad }, (_, i) => {
    const desde = inicio + i * DIA_MS;
    return { etiqueta: etiqueta(local(desde)), desde, hasta: desde + DIA_MS };
  });
}

export function resolverPeriodo(params: ParametrosRango, ahora = Date.now()): Periodo {
  const rango: Rango = esRango(params.rango) ? params.rango : "anio";
  const hoy = local(ahora);
  const [hA, hM, hD] = [hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()];

  // Valores elegidos o, si faltan o no son válidos, los de hoy
  const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(params.fecha ?? "");
  const [fA, fM, fD] = fechaValida
    ? params.fecha!.split("-").map(Number)
    : [hA, hM + 1, hD];
  const mesValido = /^\d{4}-\d{2}$/.test(params.mes ?? "");
  const [mA, mM] = mesValido ? params.mes!.split("-").map(Number) : [hA, hM + 1];
  const anio = /^\d{4}$/.test(params.anio ?? "") ? Number(params.anio) : hA;

  const base = {
    rango,
    fecha: `${fA}-${dosCifras(fM)}-${dosCifras(fD)}`,
    mes: `${mA}-${dosCifras(mM)}`,
    anio,
  };

  if (rango === "hoy" || rango === "dia") {
    const [a, m, d] = rango === "hoy" ? [hA, hM, hD] : [fA, fM - 1, fD];
    const dia = new Date(Date.UTC(a, m, d));
    const nombre = `${DIAS[dia.getUTCDay()]} ${d} de ${MESES[m]}`;
    return {
      ...base,
      titulo: rango === "hoy" ? `Hoy, ${nombre}` : `${nombre[0].toUpperCase()}${nombre.slice(1)} de ${a}`,
      desde: desdeLocal(a, m, d),
      hasta: desdeLocal(a, m, d + 1),
      cubetas: porHoras(a, m, d),
    };
  }

  if (rango === "semana") {
    const inicio = desdeLocal(hA, hM, hD - 6);
    const cubetas = porDias(inicio, 7, (d) =>
      `${DIAS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()}/${d.getUTCMonth() + 1}`,
    );
    return {
      ...base,
      titulo: `Últimos 7 días (${cubetas[0].etiqueta.slice(4)} al ${cubetas[6].etiqueta.slice(4)})`,
      desde: inicio,
      hasta: inicio + 7 * DIA_MS,
      cubetas,
    };
  }

  if (rango === "mes") {
    const dias = new Date(Date.UTC(mA, mM, 0)).getUTCDate();
    const inicio = desdeLocal(mA, mM - 1);
    return {
      ...base,
      titulo: `${MESES[mM - 1][0].toUpperCase()}${MESES[mM - 1].slice(1)} de ${mA}`,
      desde: inicio,
      hasta: desdeLocal(mA, mM),
      cubetas: porDias(inicio, dias, (d) => String(d.getUTCDate())),
    };
  }

  return {
    ...base,
    titulo: `Año ${anio}`,
    desde: desdeLocal(anio, 0),
    hasta: desdeLocal(anio + 1, 0),
    cubetas: MESES.map((nombre, m) => ({
      etiqueta: nombre.slice(0, 3),
      desde: desdeLocal(anio, m),
      hasta: desdeLocal(anio, m + 1),
    })),
  };
}

export type Estadisticas = {
  reportes: number;
  nuevos: number;
  cerrados: number;
  promedioDiasResolucion: number | null;
  serie: { reportes: number[]; nuevos: number[]; cerrados: number[] };
  porCategoria: { nombre: string; slug: string; cantidad: number }[];
};

export function calcularEstadisticas(
  periodo: Periodo,
  incidentes: IncidenteResumen[],
  fechasDeReportes: string[],
  categorias: Pick<Categoria, "nombre" | "slug">[],
): Estadisticas {
  const enPeriodo = (iso: string | null) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    return t >= periodo.desde && t < periodo.hasta;
  };

  const porCubeta = (fechas: string[]) =>
    periodo.cubetas.map(
      ({ desde, hasta }) =>
        fechas.filter((iso) => {
          const t = new Date(iso).getTime();
          return t >= desde && t < hasta;
        }).length,
    );

  const reportes = fechasDeReportes.filter(enPeriodo);
  const nuevos = incidentes.filter((i) => enPeriodo(i.fechaApertura));
  const cerrados = incidentes.filter((i) => i.estado === "cerrado" && enPeriodo(i.fechaCierre));

  const dias = cerrados.map(
    (i) => (new Date(i.fechaCierre!).getTime() - new Date(i.fechaApertura).getTime()) / DIA_MS,
  );

  const porCategoria = categorias
    .map(({ nombre, slug }) => ({
      nombre,
      slug,
      cantidad: nuevos.filter((i) => i.categoria?.slug === slug).length,
    }))
    .filter((c) => c.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, "es"));

  return {
    reportes: reportes.length,
    nuevos: nuevos.length,
    cerrados: cerrados.length,
    promedioDiasResolucion: dias.length ? dias.reduce((s, d) => s + d, 0) / dias.length : null,
    serie: {
      reportes: porCubeta(reportes),
      nuevos: porCubeta(nuevos.map((i) => i.fechaApertura)),
      cerrados: porCubeta(cerrados.map((i) => i.fechaCierre!)),
    },
    porCategoria,
  };
}

// Años con datos, más el actual, para el selector
export function aniosDisponibles(incidentes: IncidenteResumen[], ahora = Date.now()): number[] {
  const anios = new Set([local(ahora).getUTCFullYear()]);
  for (const i of incidentes) anios.add(local(new Date(i.fechaApertura).getTime()).getUTCFullYear());
  return [...anios].sort((a, b) => b - a);
}
