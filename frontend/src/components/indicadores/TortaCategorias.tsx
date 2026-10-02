"use client";

import { useTheme } from "@/context/ThemeContext";
import { Link } from "@/i18n/navigation";
import { formatearNumero, type PorCategoria } from "@/lib/indicadores";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Paleta categórica validada para daltonismo sobre el fondo de las tarjetas,
// con un paso propio para cada tema. El color sigue a la categoría (por su
// orden alfabético), no a su cantidad, así no cambia cuando cambian los datos.
const COLORES = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"],
};

// Fondo de la tarjeta en cada tema: separa las porciones entre sí
const SUPERFICIE = { light: "#ffffff", dark: "#1c1c1f" };

type Props = {
  categorias: PorCategoria[];
  total: number;
};

export default function TortaCategorias({ categorias, total }: Props) {
  const { theme } = useTheme();
  const paleta = COLORES[theme];
  const colorDe = (c: PorCategoria) => paleta[c.orden % paleta.length];

  // Las categorías sin incidentes van en la leyenda pero no en la torta
  const conIncidentes = categorias.filter((c) => c.cantidad > 0);

  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    labels: conIncidentes.map((c) => c.nombre),
    colors: conIncidentes.map(colorDe),
    stroke: { width: 2, colors: [SUPERFICIE[theme]] },
    legend: { show: false },
    dataLabels: { enabled: false },
    states: { active: { filter: { type: "none" } } },
    tooltip: {
      theme,
      y: { formatter: (valor: number) => `${valor} incidentes` },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: { color: theme === "dark" ? "#a1a1aa" : "#71717a" },
            value: {
              fontSize: "28px",
              fontWeight: 700,
              color: theme === "dark" ? "rgba(255,255,255,0.9)" : "#27272a",
            },
            total: {
              show: true,
              label: "Incidentes",
              color: theme === "dark" ? "#a1a1aa" : "#71717a",
              formatter: () => String(total),
            },
          },
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Incidentes por categoría
      </h3>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        Cada categoría lleva al listado filtrado
      </p>

      {total === 0 ? (
        <p className="py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400">
          Todavía no hay incidentes cargados.
        </p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-6 lg:flex-row lg:gap-12">
          <div className="w-full max-w-80 shrink-0">
            <ReactApexChart
              options={options}
              series={conIncidentes.map((c) => c.cantidad)}
              type="donut"
              height={320}
            />
          </div>

          <ul className="w-full max-w-xl divide-y divide-gray-100 dark:divide-white/5">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/incidentes?categoria=${c.slug}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-theme-sm hover:bg-gray-50 dark:hover:bg-white/3"
                >
                  <span
                    className="size-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: colorDe(c) }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-gray-700 dark:text-gray-300">
                    {c.nombre}
                  </span>
                  <span className="font-medium text-gray-800 tabular-nums dark:text-white/90">
                    {c.cantidad}
                  </span>
                  <span className="w-14 text-end text-gray-500 tabular-nums dark:text-gray-400">
                    {formatearNumero(c.porcentaje)} %
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
