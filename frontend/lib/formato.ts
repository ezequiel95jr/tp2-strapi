import type { Estado } from "./types";

export const ESTADOS: Record<
  Estado,
  { texto: string; clases: string }
> = {
  abierto: {
    texto: "Abierto",
    clases: "bg-error-50 text-error-500",
  },
  en_curso: {
    texto: "En curso",
    clases: "bg-warning-50 text-warning-500",
  },
  cerrado: {
    texto: "Cerrado",
    clases: "bg-success-50 text-success-500",
  },
};

const ESTADO_DESCONOCIDO = {
  texto: "Sin estado",
  clases: "bg-gray-100 text-gray-600",
};

export function estadoDe(valor: string) {
  return ESTADOS[valor as Estado] ?? {
    ...ESTADO_DESCONOCIDO,
    texto: valor.replace(/_/g, " "),
  };
}

export function formatearFecha(iso: string | null): string {
  if (!iso) return "-";

  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function diasEntre(desde: string, hasta: string): number {
  const diferencia = new Date(hasta).getTime() - new Date(desde).getTime();
  return Math.round(diferencia / (1000 * 60 * 60 * 24));
}
