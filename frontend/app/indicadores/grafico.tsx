"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORES = [
  "#465fff",
  "#0ba5ec",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#7a5af8",
  "#12b76a",
];

type Props = {
  datos: { nombre: string; total: number }[];
};

export default function GraficoCategorias({ datos }: Props) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={datos}
            dataKey="total"
            nameKey="nombre"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {datos.map((entrada, indice) => (
              <Cell
                key={entrada.nombre}
                fill={COLORES[indice % COLORES.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(valor) => [`${valor} incidentes`, "Total"]}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
