import type { Estado } from "./types";

type ColorEstado = "error" | "warning" | "success" | "light";

export const ESTADOS: Record<Estado, { texto: string; color: ColorEstado }> = {
  abierto: { texto: "Abierto", color: "error" },
  en_curso: { texto: "En curso", color: "warning" },
  cerrado: { texto: "Cerrado", color: "success" },
};

export function estadoDe(valor: string): { texto: string; color: ColorEstado } {
  return (
    ESTADOS[valor as Estado] ?? {
      texto: valor.replace(/_/g, " "),
      color: "light",
    }
  );
}

export function formatearFecha(iso: string | null): string {
  if (!iso) return "-";

  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
