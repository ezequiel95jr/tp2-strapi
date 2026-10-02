import type { Incidente, RespuestaPaginada } from "./types";

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
};

function construirQuery(filtros: Filtros): string {
  const params = new URLSearchParams();

  if (filtros.pagina) {
    params.set("pagination[page]", String(filtros.pagina));
  }

  if (filtros.porPagina) {
    params.set("pagination[pageSize]", String(filtros.porPagina));
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
