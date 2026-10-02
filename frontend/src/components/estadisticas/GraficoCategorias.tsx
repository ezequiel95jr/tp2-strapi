"use client";

import { useTheme } from "@/context/ThemeContext";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Una sola serie: un solo color, el mismo de "Incidentes nuevos" en el gráfico de actividad
const COLOR = { light: "#eb6834", dark: "#d95926" };
const TEXTO = { light: "#71717a", dark: "#a1a1aa" };

type Props = {
  categorias: { nombre: string; cantidad: number }[];
};

// Barras horizontales ordenadas de mayor a menor
export default function GraficoCategorias({ categorias }: Props) {
  const { theme } = useTheme();

  const options: ApexOptions = {
    chart: { type: "bar", fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
    colors: [COLOR[theme]],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "60%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 20,
      style: { colors: [theme === "dark" ? "rgba(255,255,255,0.9)" : "#27272a"], fontWeight: 500 },
    },
    // Cada barra ya muestra su número, así que el eje de valores sobra
    grid: { show: false },
    xaxis: {
      categories: categorias.map((c) => c.nombre),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: TEXTO[theme] } } },
    legend: { show: false },
    tooltip: { theme, y: { formatter: (v: number) => `${v} incidentes` } },
    states: { active: { filter: { type: "none" } } },
  };

  return (
    <ReactApexChart
      options={options}
      series={[{ name: "Incidentes nuevos", data: categorias.map((c) => c.cantidad) }]}
      type="bar"
      height={Math.max(160, categorias.length * 40 + 40)}
    />
  );
}
