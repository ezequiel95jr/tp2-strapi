import Link from "next/link";
import { Contenido, Panel, PanelEncabezado, PanelLateral } from "@/components/panel";
import { obtenerIncidentes } from "@/lib/api";
import { estadoDe, formatearFecha } from "@/lib/formato";

export const metadata = {
  title: "Dashboard | SnapIt",
};

export default async function Home() {
  const respuesta = await obtenerIncidentes({
    pagina: 1,
    porPagina: 5,
  });

  const recientes = respuesta.data;

  return (
    <Panel>
      <PanelLateral actual="/" />
      <div className="lg:pl-64">
        <PanelEncabezado
          titulo="Dashboard"
          descripcion="Resumen del estado de los incidentes de la vía pública"
        />

        <Contenido>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500">Incidentes totales</p>
              <p className="mt-2 text-2xl font-semibold">
                {respuesta.meta.pagination.total}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500">Abiertos</p>
              <p className="mt-2 text-2xl font-semibold text-error-500">
                {recientes.filter((i) => i.estado === "abierto").length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500">Cerrados</p>
              <p className="mt-2 text-2xl font-semibold text-success-500">
                {recientes.filter((i) => i.estado === "cerrado").length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500">Zonas cubiertas</p>
              <p className="mt-2 text-2xl font-semibold">
                {new Set(recientes.map((i) => i.zona?.id)).size}
              </p>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Reportes recientes
              </h3>
              <Link
                href="/incidentes"
                className="text-sm text-brand-600 hover:underline"
              >
                Ver todos
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Titulo</th>
                    <th className="px-6 py-4">Zona</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Apertura</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((incidente) => {
                    const estado = estadoDe(incidente.estado);

                    return (
                      <tr
                        key={incidente.documentId}
                        className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/incidentes/${incidente.documentId}`}
                            className="font-medium hover:text-brand-600"
                          >
                            {incidente.titulo}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {incidente.zona?.nombre ?? "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.clases}`}
                          >
                            {estado.texto}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {formatearFecha(incidente.fechaApertura)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </Contenido>
      </div>
    </Panel>
  );
}
