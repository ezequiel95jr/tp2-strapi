import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CambiarEstado from "@/components/incidentes/CambiarEstado";
import FiltrosIncidentes from "@/components/incidentes/FiltrosIncidentes";
import { Link } from "@/i18n/navigation";
import { obtenerCategorias, obtenerIncidentes, obtenerZonas } from "@/lib/api";
import { esEstado, urlIncidentes } from "@/lib/filtros";
import { ESTADOS, formatearFecha } from "@/lib/formato";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Incidentes | SnapIt",
};

type Props = {
  searchParams: Promise<{
    pagina?: string;
    categoria?: string;
    zona?: string;
    estado?: string;
  }>;
};

const POR_PAGINA = 10;

const COLUMNAS = ["Título", "Categoría", "Zona", "Estado", "Apertura", "Cierre"];

export default async function Incidentes({ searchParams }: Props) {
  const params = await searchParams;

  const pagina = Number(params.pagina ?? "1") || 1;

  // Un estado inválido haría fallar el filtro en Strapi, así que se ignora
  const filtros = {
    categoria: params.categoria,
    zona: params.zona,
    estado: esEstado(params.estado) ? params.estado : undefined,
  };
  const hayFiltros = Object.values(filtros).some(Boolean);

  const [respuesta, categorias, zonas] = await Promise.all([
    obtenerIncidentes({ ...filtros, pagina, porPagina: POR_PAGINA }),
    obtenerCategorias(),
    obtenerZonas(),
  ]);

  const { pagination } = respuesta.meta;

  return (
    <div>
      <PageBreadcrumb pageTitle="Incidentes" />
      <ComponentCard
        title="Incidentes"
        desc={
          hayFiltros
            ? `${pagination.total} incidentes con los filtros elegidos`
            : `${pagination.total} incidentes reportados en la vía pública`
        }
      >
        <FiltrosIncidentes
          key={urlIncidentes(filtros)}
          actuales={filtros}
          categorias={categorias.data.map((c) => ({ value: c.slug, label: c.nombre }))}
          zonas={zonas.data.map((z) => ({ value: z.slug, label: z.nombre }))}
          estados={Object.entries(ESTADOS).map(([valor, { texto }]) => ({ value: valor, label: texto }))}
        />

        {hayFiltros && (
          <Link
            href="/incidentes"
            className="inline-block text-sm text-brand-500 hover:underline"
          >
            Limpiar filtros
          </Link>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  {COLUMNAS.map((columna) => (
                    <TableCell
                      key={columna}
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {columna}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {respuesta.data.map((incidente) => {
                  return (
                    <TableRow key={incidente.documentId}>
                      <TableCell className="px-5 py-4 text-start">
                        <Link
                          href={`/incidentes/${incidente.documentId}`}
                          className="block text-theme-sm font-medium text-gray-800 hover:text-brand-500 dark:text-white/90"
                        >
                          {incidente.titulo}
                        </Link>
                        <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                          {incidente.direccion}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {incidente.categoria?.nombre ?? "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {incidente.zona?.nombre ?? "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm">
                        <CambiarEstado
                          documentId={incidente.documentId}
                          estado={incidente.estado}
                          titulo={incidente.titulo}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {formatearFecha(incidente.fechaApertura)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {formatearFecha(incidente.fechaCierre)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {respuesta.data.length === 0 && (
              <p className="px-5 py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                {hayFiltros
                  ? "No hay incidentes con esos filtros."
                  : "Todavía no hay incidentes cargados."}
              </p>
            )}
          </div>
        </div>

        {pagination.pageCount > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Página {pagination.page} de {pagination.pageCount}
            </span>

            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Link
                  href={urlIncidentes(filtros, pagination.page - 1)}
                  className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
                >
                  Anterior
                </Link>
              )}

              {pagination.page < pagination.pageCount && (
                <Link
                  href={urlIncidentes(filtros, pagination.page + 1)}
                  className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
