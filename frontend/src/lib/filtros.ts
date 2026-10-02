import { ESTADOS } from "./formato";
import type { Estado } from "./types";

export type FiltrosIncidentes = {
  categoria?: string;
  zona?: string;
  estado?: string;
};

export function urlIncidentes(filtros: FiltrosIncidentes, pagina = 1): string {
  const params = new URLSearchParams();

  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor) params.set(clave, valor);
  }

  if (pagina > 1) params.set("pagina", String(pagina));

  const query = params.toString();
  return query ? `/incidentes?${query}` : "/incidentes";
}

export function esEstado(valor?: string): valor is Estado {
  return valor !== undefined && valor in ESTADOS;
}
