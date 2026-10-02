import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FiltroRango from "@/components/estadisticas/FiltroRango";
import GraficoActividad from "@/components/estadisticas/GraficoActividad";
import GraficoCategorias from "@/components/estadisticas/GraficoCategorias";
import TarjetaIndicador from "@/components/indicadores/TarjetaIndicador";
import { AlertIcon, CheckCircleIcon, ChatIcon, TimeIcon } from "@/icons";
import {
  obtenerCategorias,
  obtenerFechasDeReportes,
  obtenerTodosLosIncidentes,
} from "@/lib/api";
import {
  aniosDisponibles,
  calcularEstadisticas,
  resolverPeriodo,
  type ParametrosRango,
} from "@/lib/estadisticas";
import { formatearNumero } from "@/lib/indicadores";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indicadores | SnapIt",
};

type Props = {
  searchParams: Promise<ParametrosRango>;
};

export default async function Indicadores({ searchParams }: Props) {
  const periodo = resolverPeriodo(await searchParams);

  const [incidentes, fechasDeReportes, categorias] = await Promise.all([
    obtenerTodosLosIncidentes(),
    obtenerFechasDeReportes(),
    obtenerCategorias(),
  ]);

  const estadisticas = calcularEstadisticas(
    periodo,
    incidentes,
    fechasDeReportes,
    categorias.data,
  );
  const sinActividad = estadisticas.reportes + estadisticas.nuevos + estadisticas.cerrados === 0;

  return (
    <div>
      <PageBreadcrumb pageTitle="Indicadores" />

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
          <FiltroRango
            rango={periodo.rango}
            fecha={periodo.fecha}
            mes={periodo.mes}
            anio={periodo.anio}
            anios={aniosDisponibles(incidentes)}
          />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {periodo.titulo}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          <TarjetaIndicador
            icono={<ChatIcon className="size-6" />}
            titulo="Reportes recibidos"
            valor={formatearNumero(estadisticas.reportes)}
          />
          <TarjetaIndicador
            icono={<AlertIcon className="size-6" />}
            titulo="Incidentes nuevos"
            valor={formatearNumero(estadisticas.nuevos)}
          />
          <TarjetaIndicador
            icono={<CheckCircleIcon className="size-6" />}
            titulo="Incidentes cerrados"
            valor={formatearNumero(estadisticas.cerrados)}
          />
          <TarjetaIndicador
            icono={<TimeIcon className="size-6" />}
            titulo="Promedio de resolución"
            valor={
              estadisticas.promedioDiasResolucion === null
                ? "-"
                : `${formatearNumero(estadisticas.promedioDiasResolucion, 1)} días`
            }
            detalle="De los incidentes cerrados en el período"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Actividad
          </h3>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            {periodo.cubetas.length === 24
              ? "Por hora"
              : periodo.cubetas.length === 12
                ? "Por mes"
                : "Por día"}
          </p>

          {sinActividad ? (
            <p className="py-16 text-center text-theme-sm text-gray-500 dark:text-gray-400">
              No hubo reportes ni movimientos de incidentes en este período.
            </p>
          ) : (
            <div className="mt-4">
              <GraficoActividad
                etiquetas={periodo.cubetas.map((c) => c.etiqueta)}
                serie={estadisticas.serie}
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Incidentes nuevos por categoría
          </h3>

          {estadisticas.porCategoria.length === 0 ? (
            <p className="py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400">
              No se abrieron incidentes en este período.
            </p>
          ) : (
            <div className="mt-2">
              <GraficoCategorias categorias={estadisticas.porCategoria} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
