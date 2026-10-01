import Link from "next/link";
import { Contenido, Panel, PanelEncabezado, PanelLateral } from "@/components/panel";
import { obtenerIncidentes } from "@/lib/api";
import { estadoDe, formatearFecha } from "@/lib/formato";

export const metadata = {
  title: "Incidentes | SnapIt",
};

type Props = {
  searchParams: Promise<{
    pagina?: string;
  }>;
};

const POR_PAGINA = 10;

export default async function Incidentes({ searchParams }: Props) {
  const params = await searchParams;

  const pagina = Number(params.pagina ?? "1") || 1;

  const respuesta = await obtenerIncidentes({
    pagina,
    porPagina: POR_PAGINA,
  });

  const { pagination } = respuesta.meta;

  function construirPagina(nuevaPagina: number): string {
    return nuevaPagina > 1
      ? `/incidentes?pagina=${nuevaPagina}`
      : "/incidentes";
  }

  return (
    <Panel>
      <PanelLateral actual="/incidentes" />
      <div className="lg:pl-64">
        <PanelEncabezado
          titulo="Incidentes"
          descripcion={`${pagination.total} incidentes reportados en la vía pública`}
        />

        <Contenido>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Titulo</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Zona</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Apertura</th>
                  <th className="px-6 py-4">Cierre</th>
                </tr>
              </thead>
              <tbody>
                {respuesta.data.map((incidente) => {
                  const estado = estadoDe(incidente.estado);

                  return (
                    <tr
                      key={incidente.documentId}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/incidentes/${incidente.documentId}`}
                          className="font-medium hover:text-brand-600"
                        >
                          {incidente.titulo}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {incidente.direccion}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {incidente.categoria?.nombre ?? "-"}
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
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {formatearFecha(incidente.fechaCierre)}
                      </td>
                    </tr>
                  );
                })}

                {respuesta.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Todavia no hay incidentes cargados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.pageCount > 1 && (
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Pagina {pagination.page} de {pagination.pageCount}
              </span>

              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <Link
                    href={construirPagina(pagination.page - 1)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >
                    Anterior
                  </Link>
                )}

                {pagination.page < pagination.pageCount && (
                  <Link
                    href={construirPagina(pagination.page + 1)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >
                    Siguiente
                  </Link>
                )}
              </div>
            </div>
          )}
        </Contenido>
      </div>
    </Panel>
  );
}
