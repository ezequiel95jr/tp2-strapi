import Link from "next/link";
import { Contenido, Panel, PanelEncabezado, PanelLateral } from "@/components/panel";
import {
  obtenerCategorias,
  obtenerIncidentes,
  obtenerZonas,
} from "@/lib/api";
import { estadoDe, ESTADOS, formatearFecha } from "@/lib/formato";

export const metadata = {
  title: "Incidentes | SnapIt",
};

type Props = {
  searchParams: Promise<{
    estado?: string;
    categoria?: string;
    zona?: string;
    pagina?: string;
  }>;
};

const POR_PAGINA = 10;

export default async function Incidentes({ searchParams }: Props) {
  const params = await searchParams;

  const pagina = Number(params.pagina ?? "1") || 1;

  const [respuesta, categorias, zonas] = await Promise.all([
    obtenerIncidentes({
      pagina,
      porPagina: POR_PAGINA,
      estado: params.estado,
      categoria: params.categoria,
      zona: params.zona,
    }),
    obtenerCategorias(),
    obtenerZonas(),
  ]);

  const { pagination } = respuesta.meta;

  const filtroActivo = Boolean(params.estado || params.categoria || params.zona);

  function construirPagina(nuevaPagina: number): string {
    const query = new URLSearchParams();

    if (params.estado) query.set("estado", params.estado);
    if (params.categoria) query.set("categoria", params.categoria);
    if (params.zona) query.set("zona", params.zona);
    if (nuevaPagina > 1) query.set("pagina", String(nuevaPagina));

    const texto = query.toString();
    return texto ? `/incidentes?${texto}` : "/incidentes";
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
          <form
            method="get"
            action="/incidentes"
            className="flex flex-wrap items-end gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-500">Categoria</span>
              <select
                name="categoria"
                defaultValue={params.categoria ?? ""}
                className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800 dark:bg-gray-800"
              >
                <option value="">Todas</option>
                {categorias.data.map((categoria) => (
                  <option key={categoria.slug} value={categoria.slug}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-500">Zona</span>
              <select
                name="zona"
                defaultValue={params.zona ?? ""}
                className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800 dark:bg-gray-800"
              >
                <option value="">Todas</option>
                {zonas.data.map((zona) => (
                  <option key={zona.slug} value={zona.slug}>
                    {zona.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-500">Estado</span>
              <select
                name="estado"
                defaultValue={params.estado ?? ""}
                className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800 dark:bg-gray-800"
              >
                <option value="">Todos</option>
                {Object.entries(ESTADOS).map(([valor, estado]) => (
                  <option key={valor} value={valor}>
                    {estado.texto}
                  </option>
                ))}
              </select>
            </label>

            <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              Aplicar
            </button>

            {filtroActivo && (
              <Link
                href="/incidentes"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Limpiar
              </Link>
            )}
          </form>

          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
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
                      No hay incidentes que coincidan con los filtros.
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
