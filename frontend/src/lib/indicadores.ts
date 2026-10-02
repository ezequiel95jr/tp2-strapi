import type { Categoria, IncidenteResumen } from "./types";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export type PorCategoria = {
  nombre: string;
  slug: string;
  cantidad: number;
  porcentaje: number;
  // Posición fija de la categoría, para que siempre tenga el mismo color
  orden: number;
};

export type Indicadores = {
  total: number;
  abiertos: number;
  enCurso: number;
  cerrados: number;
  // null cuando todavía no hay incidentes cerrados
  promedioDiasResolucion: number | null;
  porCategoria: PorCategoria[];
};

const porcentaje = (parte: number, total: number) =>
  total === 0 ? 0 : (parte / total) * 100;

export function calcularIndicadores(
  incidentes: IncidenteResumen[],
  categorias: Pick<Categoria, "nombre" | "slug">[],
): Indicadores {
  const total = incidentes.length;
  const contar = (estado: IncidenteResumen["estado"]) =>
    incidentes.filter((i) => i.estado === estado).length;

  // Solo cuentan los cerrados que tienen las dos fechas
  const diasDeResolucion = incidentes
    .filter((i) => i.estado === "cerrado" && i.fechaCierre)
    .map(
      (i) =>
        (new Date(i.fechaCierre!).getTime() -
          new Date(i.fechaApertura).getTime()) /
        MS_POR_DIA,
    );

  const promedioDiasResolucion =
    diasDeResolucion.length === 0
      ? null
      : diasDeResolucion.reduce((suma, dias) => suma + dias, 0) /
        diasDeResolucion.length;

  // Orden alfabético en español: Strapi (SQLite) manda "Árbol caído" después de la "Z"
  const ordenadas = [...categorias].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es"),
  );

  const porCategoria = ordenadas.map(({ nombre, slug }, orden) => {
    const cantidad = incidentes.filter((i) => i.categoria?.slug === slug).length;
    return { nombre, slug, cantidad, porcentaje: porcentaje(cantidad, total), orden };
  });

  return {
    total,
    abiertos: contar("abierto"),
    enCurso: contar("en_curso"),
    cerrados: contar("cerrado"),
    promedioDiasResolucion,
    porCategoria,
  };
}

export function formatearNumero(valor: number, decimales = 0): string {
  return valor.toLocaleString("es-AR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}
