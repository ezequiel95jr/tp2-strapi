import Link from "next/link";
import { notFound } from "next/navigation";
import { Contenido, Panel, PanelEncabezado, PanelLateral } from "@/components/panel";
import { obtenerIncidente } from "@/lib/api";
import { estadoDe, formatearFecha } from "@/lib/formato";

export const metadata = {
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
  const estado = estadoDe(incidente.estado);

  return (
    <Panel>
      <PanelLateral actual="/incidentes" />
      <div className="lg:pl-64">
        <PanelEncabezado
          titulo={incidente.titulo}
          descripcion={incidente.direccion}
        />

        <Contenido>
          <Link
            href="/incidentes"
            className="text-sm text-gray-500 hover:text-brand-600"
          >
            Volver al listado
          </Link>

          <div className="mt-4 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-sm font-medium text-gray-500">
                  Descripcion
                </h3>
                <p className="mt-2 text-sm">{incidente.descripcion}</p>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-4 text-sm font-medium text-gray-500">
                  Reportes asociados ({incidente.reportes.length})
                </h3>

                <ul className="flex flex-col gap-3">
                  {incidente.reportes.map((reporte) => (
                    <li
                      key={reporte.documentId}
                      className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
                    >
                      <p className="text-sm">{reporte.descripcion}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatearFecha(reporte.fecha)}
                      </p>
                    </li>
                  ))}

                  {incidente.reportes.length === 0 && (
                    <li className="text-sm text-gray-500">
                      Este incidente todavia no tiene reportes.
                    </li>
                  )}
                </ul>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-4 text-sm font-medium text-gray-500">
                  Estado
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${estado.clases}`}
                >
                  {estado.texto}
                </span>

                <dl className="mt-6 flex flex-col gap-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Categoria</dt>
                    <dd className="mt-0.5">
                      {incidente.categoria?.nombre ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Zona</dt>
                    <dd className="mt-0.5">{incidente.zona?.nombre ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Apertura</dt>
                    <dd className="mt-0.5">
                      {formatearFecha(incidente.fechaApertura)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Cierre</dt>
                    <dd className="mt-0.5">
                      {formatearFecha(incidente.fechaCierre)}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        </Contenido>
      </div>
    </Panel>
  );
}
