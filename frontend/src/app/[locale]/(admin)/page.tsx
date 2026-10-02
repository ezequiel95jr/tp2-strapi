import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TarjetaIndicador from "@/components/indicadores/TarjetaIndicador";
import TortaCategorias from "@/components/indicadores/TortaCategorias";
import { AlertIcon, CheckCircleIcon, ListIcon, TimeIcon } from "@/icons";
import { obtenerCategorias, obtenerTodosLosIncidentes } from "@/lib/api";
import { calcularIndicadores, formatearNumero } from "@/lib/indicadores";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio | SnapIt",
  description: "Panel de incidentes de la vía pública",
};

export default async function Inicio() {
  const [incidentes, categorias] = await Promise.all([
    obtenerTodosLosIncidentes(),
    obtenerCategorias(),
  ]);

  // Los datos se traen completos y se agregan acá, en el frontend
  const indicadores = calcularIndicadores(incidentes, categorias.data);
  const { total, abiertos, enCurso, cerrados, promedioDiasResolucion } =
    indicadores;

  const delTotal = (parte: number) =>
    `${formatearNumero(total === 0 ? 0 : (parte / total) * 100)} %`;

  return (
    <div>
      <PageBreadcrumb pageTitle="Resumen" />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          <TarjetaIndicador
            icono={<ListIcon className="size-6" />}
            titulo="Incidentes totales"
            valor={formatearNumero(total)}
            detalle={`${enCurso} en curso`}
          />
          <TarjetaIndicador
            icono={<AlertIcon className="size-6" />}
            titulo="Abiertos"
            valor={formatearNumero(abiertos)}
            insignia={{ texto: delTotal(abiertos), color: "error" }}
          />
          <TarjetaIndicador
            icono={<CheckCircleIcon className="size-6" />}
            titulo="Cerrados"
            valor={formatearNumero(cerrados)}
            insignia={{ texto: delTotal(cerrados), color: "success" }}
          />
          <TarjetaIndicador
            icono={<TimeIcon className="size-6" />}
            titulo="Promedio de resolución"
            valor={
              promedioDiasResolucion === null
                ? "-"
                : `${formatearNumero(promedioDiasResolucion, 1)} días`
            }
            detalle={`Sobre ${cerrados} incidentes cerrados`}
          />
        </div>

        <div className="col-span-12">
          <TortaCategorias
            categorias={indicadores.porCategoria}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
