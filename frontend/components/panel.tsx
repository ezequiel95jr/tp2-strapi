import Link from "next/link";

const enlaces = [
  { href: "/", texto: "Dashboard" },
  { href: "/incidentes", texto: "Incidentes" },
];

export function PanelLateral({ actual }: { actual: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h1 className="text-lg font-semibold">SnapIt</h1>
      <p className="text-xs text-gray-500">Panel del organismo</p>

      <nav className="mt-8">
        <p className="mb-2 text-xs uppercase text-gray-400">Menu</p>
        <ul className="flex flex-col gap-1">
          {enlaces.map((enlace) => {
            const activo = enlace.href === actual;

            return (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className={
                    activo
                      ? "flex items-center gap-3 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-600"
                      : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                  }
                >
                  <span
                    className={
                      activo ? "size-2 rounded-full bg-brand-500" : "size-2 rounded-full bg-gray-300"
                    }
                  />
                  {enlace.texto}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export function PanelEncabezado({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <p className="text-sm text-gray-500">{descripcion}</p>
    </header>
  );
}

export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {children}
    </div>
  );
}

export function Contenido({ children }: { children: React.ReactNode }) {
  return <main className="p-6">{children}</main>;
}
