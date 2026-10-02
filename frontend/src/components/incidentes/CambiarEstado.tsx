"use client";

import { ChevronDownIcon } from "@/icons";
import {
  cambiarEstadoIncidente,
  type EstadoCambio,
} from "@/lib/acciones-incidentes";
import { ESTADOS } from "@/lib/formato";
import type { Estado } from "@/lib/types";
import { cn } from "@/utils";
import { useActionState, useEffect, useRef } from "react";

const ESTADO_INICIAL: EstadoCambio = { error: null };

// Mismo color que las insignias de estado del listado
const PUNTO: Record<Estado, string> = {
  abierto: "bg-error-500",
  en_curso: "bg-warning-500",
  cerrado: "bg-success-500",
};

type Props = {
  documentId: string;
  estado: Estado;
  titulo: string;
  className?: string;
};

// Selector que guarda apenas se elige otro estado
export default function CambiarEstado({ documentId, estado, titulo, className }: Props) {
  const formulario = useRef<HTMLFormElement>(null);
  const [resultado, enviar, guardando] = useActionState(
    cambiarEstadoIncidente,
    ESTADO_INICIAL,
  );

  // Si no se pudo guardar, el selector vuelve a mostrar el estado real
  useEffect(() => {
    if (resultado.error) formulario.current?.reset();
  }, [resultado]);

  return (
    <form ref={formulario} action={enviar} className={className}>
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="estadoAnterior" value={estado} />

      <div className="relative">
        <span
          className={cn(
            "pointer-events-none absolute inset-s-3 top-1/2 size-2 -translate-y-1/2 rounded-full",
            PUNTO[estado],
          )}
          aria-hidden="true"
        />
        <select
          name="estado"
          // key: cuando la página se actualiza con el estado nuevo, toma ese valor
          key={estado}
          defaultValue={estado}
          disabled={guardando}
          aria-label={`Estado de ${titulo}`}
          onChange={() => formulario.current?.requestSubmit()}
          className="h-9 w-full min-w-32 cursor-pointer appearance-none rounded-lg border border-gray-300 bg-transparent ps-7 pe-9 text-theme-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden disabled:cursor-wait disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          {Object.entries(ESTADOS).map(([valor, { texto }]) => (
            <option key={valor} value={valor} className="dark:bg-gray-900">
              {texto}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <ChevronDownIcon />
        </span>
      </div>

      {guardando && (
        <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">Guardando...</p>
      )}
      {resultado.error && !guardando && (
        <p role="alert" className="mt-1 text-theme-xs text-error-600 dark:text-error-400">
          {resultado.error}
        </p>
      )}
    </form>
  );
}
