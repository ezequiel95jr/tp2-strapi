"use client";

import { useTheme } from "@/context/ThemeContext";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Primeros tres colores de la paleta categórica validada (la misma de la torta de Inicio)
const COLORES = {
  light: ["#2a78d6", "#eb6834", "#1baf7a"],
  dark: ["#3987e5", "#d95926", "#199e70"],
};

const TEXTO = { light: "#71717a", dark: "#a1a1aa" };
const GRILLA = { light: "#f1f1f3", dark: "#27272a" };

type Props = {
  etiquetas: string[];
  serie: { reportes: number[]; nuevos: number[]; cerrados: number[] };
};

export default function GraficoActividad({ etiquetas, serie }: Props) {
  const { theme } = useTheme();
  const muchas = etiquetas.length > 12;

  const options: ApexOptions = {
    chart: { type: "bar", fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
    colors: COLORES[theme],
    plotOptions: {
      bar: {
        columnWidth: muchas ? "90%" : "55%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    // Separación entre columnas vecinas
    stroke: { show: true, width: 2, colors: ["transparent"] },
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      labels: { colors: TEXTO[theme] },
    },
    grid: { borderColor: GRILLA[theme], yaxis: { lines: { show: true } } },
    xaxis: {
      categories: etiquetas,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: TEXTO[theme] },
        rotate: -45,
        hideOverlappingLabels: true,
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      decimalsInFloat: 0,
      labels: { style: { colors: TEXTO[theme] } },
    },
    tooltip: { theme, shared: true, intersect: false },
    states: { active: { filter: { type: "none" } } },
  };

  const series = [
    { name: "Reportes recibidos", data: serie.reportes },
    { name: "Incidentes nuevos", data: serie.nuevos },
    { name: "Incidentes cerrados", data: serie.cerrados },
  ];

  return (
    <div className="custom-scrollbar max-w-full overflow-x-auto">
      <div className={muchas ? "min-w-200" : "min-w-120"}>
        <ReactApexChart options={options} series={series} type="bar" height={320} />
      </div>
    </div>
  );
}
