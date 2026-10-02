import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditarUsuario from "@/components/usuarios/EditarUsuario";
import { Link } from "@/i18n/navigation";
import { formatearFecha } from "@/lib/formato";
import { COOKIE_TOKEN, usuarioAdministrador } from "@/lib/sesion";
import {
  contarReportesPorUsuario,
  esFiltroEstado,
  obtenerUsuarios,
  type FiltroEstado,
} from "@/lib/usuarios";
import { cn } from "@/utils";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Usuarios | SnapIt",
};

type Props = {
  searchParams: Promise<{ estado?: string }>;
};

const COLUMNAS = ["Usuario", "Rol", "Estado", "Reportes", "Alta", ""];

const PESTANIAS: { valor: FiltroEstado; texto: string }[] = [
  { valor: "activos", texto: "Activos" },
  { valor: "desactivados", texto: "Desactivados" },
  { valor: "todos", texto: "Todos" },
];

export default async function Usuarios({ searchParams }: Props) {
  const { estado } = await searchParams;
  const filtro: FiltroEstado = esFiltroEstado(estado) ? estado : "activos";

  const token = (await cookies()).get(COOKIE_TOKEN)?.value;
  const [usuarios, reportes, yo] = await Promise.all([
    obtenerUsuarios(),
    contarReportesPorUsuario(),
    token ? usuarioAdministrador(token) : null,
  ]);

  // Son pocos usuarios: se traen todos y se cuentan acá para las pestañas
  const cantidad: Record<FiltroEstado, number> = {
    activos: usuarios.filter((u) => !u.blocked).length,
    desactivados: usuarios.filter((u) => u.blocked).length,
    todos: usuarios.length,
  };

  const visibles = usuarios.filter((u) =>
    filtro === "todos" ? true : filtro === "activos" ? !u.blocked : u.blocked,
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Usuarios" />
      <ComponentCard
        title="Usuarios"
        desc="Vecinos, operadores y administradores registrados en SnapIt"
      >
        <nav className="flex flex-wrap gap-2" aria-label="Filtrar por estado">
          {PESTANIAS.map(({ valor, texto }) => (
            <Link
              key={valor}
              href={valor === "activos" ? "/usuarios" : `/usuarios?estado=${valor}`}
              aria-current={filtro === valor ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-theme-sm font-medium",
                filtro === valor
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5",
              )}
            >
              {texto} <span className="tabular-nums">({cantidad[valor]})</span>
            </Link>
          ))}
        </nav>

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
                {visibles.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {usuario.username}
                        {usuario.id === yo?.id && (
                          <span className="ms-2 text-theme-xs font-normal text-gray-500 dark:text-gray-400">
                            (vos)
                          </span>
                        )}
                      </span>
                      <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                        {usuario.email}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {usuario.role?.name ?? "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <Badge size="sm" color={usuario.blocked ? "light" : "success"}>
                        {usuario.blocked ? "Desactivado" : "Activo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-800 tabular-nums dark:text-white/90">
                      {reportes.get(usuario.id) ?? 0}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatearFecha(usuario.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <EditarUsuario usuario={usuario} esUnoMismo={usuario.id === yo?.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {visibles.length === 0 && (
              <p className="px-5 py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                {filtro === "desactivados"
                  ? "No hay usuarios desactivados."
                  : "No hay usuarios para mostrar."}
              </p>
            )}
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
