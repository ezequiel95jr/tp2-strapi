import Badge from "@/components/ui/badge/Badge";

type Props = {
  icono: React.ReactNode;
  titulo: string;
  valor: string;
  detalle?: string;
  insignia?: {
    texto: string;
    color: "error" | "warning" | "success" | "light";
  };
};

// Misma tarjeta que las métricas del template, con datos de la API
export default function TarjetaIndicador({
  icono,
  titulo,
  valor,
  detalle,
  insignia,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
        {icono}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {titulo}
          </span>
          <h4 className="mt-2 text-title-sm font-bold text-gray-800 tabular-nums dark:text-white/90">
            {valor}
          </h4>
          {detalle && (
            <span className="mt-1 block text-theme-xs text-gray-500 dark:text-gray-400">
              {detalle}
            </span>
          )}
        </div>

        {insignia && (
          <Badge color={insignia.color}>{insignia.texto}</Badge>
        )}
      </div>
    </div>
  );
}
