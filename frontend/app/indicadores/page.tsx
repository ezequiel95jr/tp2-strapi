import Link from "next/link";
import GraficoCategorias from "./grafico";
import { Contenido, Panel, PanelEncabezado, PanelLateral } from "@/components/panel";
import { obtenerIncidentes } from "@/lib/api";
import { diasEntre } from "@/lib/formato";
import type { Incidente } from "@/lib/types";

export const metadata = {
  title: "Indicadores | SnapIt",
};

async function obtenerTodos(): Promise<Incidente[]> {
  const primera = await obtenerIncidentes({ pagina: 1, porPagina: 100 });

  if (primera.meta.pagination.pageCount <= 1) {
    return primera.data;
  }

  const resto = await Promise.all(
    Array.from({ length: primera.meta.pagination.pageCount - 1 }, (_, i) =>
      obtenerIncidentes({ pagina: i + 2, porPagina: 100 }),
    ),
  );

  return [primera.data, ...resto.map((r) => r.data)].flat();
}

export default async function Indicadores() {
  const incidentes = await obtenerTodos();

  const total = incidentes.length;
  const abiertos = incidentes.filter((i) => i.estado === "abierto").length;
  const cerrados = incidentes.filter((i) => i.estado === "cerrado").length;

  const resueltos = incidentes.filter(
    (i) => i.estado === "cerrado" && i.fechaCierre,
  );

  const promedioDias =
    resueltos.length > 0
      ? resueltos.reduce(
          (suma, i) => suma + diasEntre(i.fechaApertura, i.fechaCierre!),
          0,
        ) / resueltos.length
      : 0;

  const porCategoria = new Map<string, number>();

  for (const incidente of incidentes) {
    const nombre = incidente.categoria?.nombre ?? "Sin categoria";
    porCategoria.set(nombre, (porCategoria.get(nombre) ?? 0) + 1);
  }

  const datosGrafico = [...porCategoria.entries()]
    .map(([nombre, cantidad]) => ({ nombre, total: cantidad }))
    .sort((a, b) => b.total - a.total);

  const indicadores = [
    { label: "Incidentes totales", value: total },
    { label: "Abiertos", value: abiertos },
    { label: "Cerrados", value: cerrados },
    {
      label: "Promedio de días de resolución",
      value: promedioDias.toFixed(1),
    },
  ];

  return (
    <Panel>
      <PanelLateral actual="/indicadores" />
      <div className="lg:pl-64">
        <PanelEncabezado
          titulo="Indicadores"
          descripcion="Resumen de los incidentes reportados y su resolución"
        />

        <Contenido>
          <section>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {indicadores.map((indicador) => (
                <div
                  key={indicador.label}
                  className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                >
                  <p className="text-sm text-gray-500">{indicador.label}</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {indicador.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-medium text-gray-500">
                Incidentes por categoria
              </h3>
              <div className="mt-4">
                <GraficoCategorias datos={datosGrafico} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-medium text-gray-500">
                Detalle por categoria
              </h3>

              <ul className="flex flex-col">
                {datosGrafico.map((categoria) => {
                  const porcentaje =
                    total > 0
                      ? Math.round((categoria.total / total) * 100)
                      : 0;

                  return (
                    <li
                      key={categoria.nombre}
                      className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 dark:border-gray-800"
                    >
                      <Link
                        href={`/incidentes?categoria=${categoria.nombre
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/\s+/g, "-")}`}
                        className="text-sm hover:text-brand-600"
                      >
                        {categoria.nombre}
                      </Link>
                      <span className="text-sm text-gray-500">
                        {categoria.total} ({porcentaje}%)
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </Contenido>
      </div>
    </Panel>
  );
}
