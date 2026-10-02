import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CambiarEstado from "@/components/incidentes/CambiarEstado";
import { Link } from "@/i18n/navigation";
import { obtenerIncidente } from "@/lib/api";
import { formatearFecha } from "@/lib/formato";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Detalle del incidente | SnapIt",
};

type Props = {
  params: Promise<{ documentId: string }>;
};

export default async function DetalleIncidente({ params }: Props) {
  const { documentId } = await params;

  const respuesta = await obtenerIncidente(documentId).catch(() => null);

  if (!respuesta?.data) {
    notFound();
  }

  const incidente = respuesta.data;

  return (
    <div>
      <PageBreadcrumb pageTitle={incidente.titulo} />

      <Link
        href="/incidentes"
        className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400"
      >
        Volver al listado
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ComponentCard title="Descripción" desc={incidente.direccion}>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {incidente.descripcion}
            </p>
          </ComponentCard>

          <ComponentCard
            title={`Reportes asociados (${incidente.reportes.length})`}
          >
            <ul className="flex flex-col gap-3">
              {incidente.reportes.map((reporte) => (
                <li
                  key={reporte.documentId}
                  className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {reporte.descripcion}
                  </p>
                  <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                    {formatearFecha(reporte.fecha)}
                  </p>
                </li>
              ))}

              {incidente.reportes.length === 0 && (
                <li className="text-sm text-gray-500 dark:text-gray-400">
                  Este incidente todavía no tiene reportes.
                </li>
              )}
            </ul>
          </ComponentCard>
        </div>

        <ComponentCard title="Estado" className="h-fit">
          <CambiarEstado
            documentId={incidente.documentId}
            estado={incidente.estado}
            titulo={incidente.titulo}
          />

          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Categoría</dt>
              <dd className="mt-0.5 text-gray-800 dark:text-white/90">
                {incidente.categoria?.nombre ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Zona</dt>
              <dd className="mt-0.5 text-gray-800 dark:text-white/90">
                {incidente.zona?.nombre ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Apertura</dt>
              <dd className="mt-0.5 text-gray-800 dark:text-white/90">
                {formatearFecha(incidente.fechaApertura)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Cierre</dt>
              <dd className="mt-0.5 text-gray-800 dark:text-white/90">
                {formatearFecha(incidente.fechaCierre)}
              </dd>
            </div>
          </dl>
        </ComponentCard>
      </div>
    </div>
  );
}
