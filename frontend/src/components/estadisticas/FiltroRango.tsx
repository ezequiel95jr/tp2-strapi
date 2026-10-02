"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { MESES, RANGOS, type Rango } from "@/lib/estadisticas";
import { cn } from "@/utils";

type Props = {
  rango: Rango;
  fecha: string;
  mes: string;
  anio: number;
  anios: number[];
};

const CLASE_CAMPO =
  "h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-theme-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";

export default function FiltroRango({ rango, fecha, mes, anio, anios }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const ir = (params: Record<string, string>) =>
    router.push(`${pathname}?${new URLSearchParams(params)}`);

  const [mesAnio, mesNumero] = mes.split("-");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label="Rango de tiempo"
        className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900"
      >
        {RANGOS.map(({ valor, texto }) => (
          <button
            key={valor}
            type="button"
            aria-pressed={rango === valor}
            onClick={() => ir({ rango: valor })}
            className={cn(
              "rounded-md px-3 py-2 text-theme-sm font-medium",
              rango === valor
                ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
            )}
          >
            {texto}
          </button>
        ))}
      </div>

      {rango === "dia" && (
        <input
          id="filtro-fecha"
          type="date"
          aria-label="Día"
          value={fecha}
          onChange={(e) => e.target.value && ir({ rango, fecha: e.target.value })}
          className={CLASE_CAMPO}
        />
      )}

      {rango === "mes" && (
        <>
          <select
            id="filtro-mes"
            aria-label="Mes"
            value={mesNumero}
            onChange={(e) => ir({ rango, mes: `${mesAnio}-${e.target.value}` })}
            className={CLASE_CAMPO}
          >
            {MESES.map((nombre, i) => (
              <option key={nombre} value={String(i + 1).padStart(2, "0")}>
                {nombre[0].toUpperCase() + nombre.slice(1)}
              </option>
            ))}
          </select>
          <select
            id="filtro-mes-anio"
            aria-label="Año del mes"
            value={mesAnio}
            onChange={(e) => ir({ rango, mes: `${e.target.value}-${mesNumero}` })}
            className={CLASE_CAMPO}
          >
            {anios.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </>
      )}

      {rango === "anio" && (
        <select
          id="filtro-anio"
          aria-label="Año"
          value={anio}
          onChange={(e) => ir({ rango, anio: e.target.value })}
          className={CLASE_CAMPO}
        >
          {anios.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      )}
    </div>
  );
}
