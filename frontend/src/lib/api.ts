import type {
  Categoria,
  Incidente,
  IncidenteResumen,
  RespuestaPaginada,
  Zona,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337";

export class ErrorApi extends Error {
  constructor(
    public estado: number,
    message: string,
  ) {
    super(message);
    this.name = "ErrorApi";
  }
}

async function pedir<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, { cache: "no-store" });

  if (!respuesta.ok) {
    throw new ErrorApi(
      respuesta.status,
      `La API respondió ${respuesta.status} en ${ruta}`,
    );
  }

  return (await respuesta.json()) as T;
}

export type Filtros = {
  pagina?: number;
  porPagina?: number;
  categoria?: string;
  zona?: string;
  estado?: string;
};

function construirQuery(filtros: Filtros): string {
  const params = new URLSearchParams();

  if (filtros.pagina) {
    params.set("pagination[page]", String(filtros.pagina));
  }

  if (filtros.porPagina) {
    params.set("pagination[pageSize]", String(filtros.porPagina));
  }

  // El filtrado lo hace Strapi: solo pasamos los parámetros
  if (filtros.categoria) {
    params.set("filters[categoria][slug][$eq]", filtros.categoria);
  }

  if (filtros.zona) {
    params.set("filters[zona][slug][$eq]", filtros.zona);
  }

  if (filtros.estado) {
    params.set("filters[estado][$eq]", filtros.estado);
  }

  params.set("populate", "*");
  params.set("sort", "fechaApertura:desc");

  return params.toString();
}

export function obtenerIncidentes(
  filtros: Filtros = {},
): Promise<RespuestaPaginada<Incidente>> {
  return pedir(`/api/incidentes?${construirQuery(filtros)}`);
}

export function obtenerIncidente(
  documentId: string,
): Promise<{ data: Incidente }> {
  return pedir(`/api/incidentes/${documentId}?populate=*`);
}

// Strapi devuelve como máximo 100 por página, así que se recorren todas
export async function obtenerTodosLosIncidentes(): Promise<IncidenteResumen[]> {
  const params = new URLSearchParams({
    "fields[0]": "estado",
    "fields[1]": "fechaApertura",
    "fields[2]": "fechaCierre",
    "populate[categoria][fields][0]": "nombre",
    "populate[categoria][fields][1]": "slug",
    "pagination[pageSize]": "100",
  });

  const incidentes: IncidenteResumen[] = [];
  let pagina = 1;
  let totalPaginas = 1;

  do {
    params.set("pagination[page]", String(pagina));
    const respuesta = await pedir<RespuestaPaginada<IncidenteResumen>>(
      `/api/incidentes?${params}`,
    );
    incidentes.push(...respuesta.data);
    totalPaginas = respuesta.meta.pagination.pageCount;
    pagina++;
  } while (pagina <= totalPaginas);

  return incidentes;
}

// Solo la fecha de cada reporte, para las estadísticas por período
export async function obtenerFechasDeReportes(): Promise<string[]> {
  const params = new URLSearchParams({
    "fields[0]": "fecha",
    "pagination[pageSize]": "100",
  });

  const fechas: string[] = [];
  let pagina = 1;
  let totalPaginas = 1;

  do {
    params.set("pagination[page]", String(pagina));
    const respuesta = await pedir<RespuestaPaginada<{ fecha: string }>>(
      `/api/reportes?${params}`,
    );
    fechas.push(...respuesta.data.map((r) => r.fecha));
    totalPaginas = respuesta.meta.pagination.pageCount;
    pagina++;
  } while (pagina <= totalPaginas);

  return fechas;
}

export function obtenerCategorias(): Promise<{ data: Categoria[] }> {
  return pedir("/api/categorias?pagination[pageSize]=100&sort=nombre:asc");
}

export function obtenerZonas(): Promise<{ data: Zona[] }> {
  return pedir("/api/zonas?pagination[pageSize]=100&sort=nombre:asc");
}
