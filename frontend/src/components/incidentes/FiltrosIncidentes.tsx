"use client";

import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useRouter } from "@/i18n/navigation";
import { type FiltrosIncidentes, urlIncidentes } from "@/lib/filtros";

const TODOS = "todos";

type Opcion = { value: string; label: string };

type Props = {
  actuales: FiltrosIncidentes;
  categorias: Opcion[];
  zonas: Opcion[];
  estados: Opcion[];
};

export default function FiltrosIncidentes({
  actuales,
  categorias,
  zonas,
  estados,
}: Props) {
  const router = useRouter();

  // Cambiar un filtro vuelve a la primera página
  function cambiar(filtro: keyof FiltrosIncidentes, valor: string) {
    router.push(
      urlIncidentes({ ...actuales, [filtro]: valor === TODOS ? undefined : valor }),
    );
  }

  const selects = [
    { filtro: "categoria", titulo: "Categoría", todos: "Todas las categorías", opciones: categorias },
    { filtro: "zona", titulo: "Zona", todos: "Todas las zonas", opciones: zonas },
    { filtro: "estado", titulo: "Estado", todos: "Todos los estados", opciones: estados },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {selects.map(({ filtro, titulo, todos, opciones }) => (
        <div key={filtro}>
          <Label>{titulo}</Label>
          <Select
            options={[{ value: TODOS, label: todos }, ...opciones]}
            defaultValue={actuales[filtro] ?? TODOS}
            onChange={(valor) => cambiar(filtro, valor)}
          />
        </div>
      ))}
    </div>
  );
}
