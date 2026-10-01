import type {
  Categoria,
  Incidente,
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
  estado?: string;
  categoria?: string;
  zona?: string;
};

function construirQuery(filtros: Filtros): string {
  const params = new URLSearchParams();

  if (filtros.pagina) {
    params.set("pagination[page]", String(filtros.pagina));
  }

  if (filtros.porPagina) {
    params.set("pagination[pageSize]", String(filtros.porPagina));
  }

  if (filtros.estado) {
    params.set("filters[estado][$eq]", filtros.estado);
  }

  if (filtros.categoria) {
    params.set("filters[categoria][slug][$eq]", filtros.categoria);
  }

  if (filtros.zona) {
    params.set("filters[zona][slug][$eq]", filtros.zona);
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

export function obtenerCategorias(): Promise<{ data: Categoria[] }> {
  return pedir("/api/categorias?pagination[pageSize]=100&sort=nombre:asc");
}

export function obtenerZonas(): Promise<{ data: Zona[] }> {
  return pedir("/api/zonas?pagination[pageSize]=100&sort=nombre:asc");
}
