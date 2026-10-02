// Usuarios de Users & Permissions. Estos endpoints no son públicos: se
// consultan desde el servidor con el token del administrador que inició sesión.

import { tokenActual } from "./token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337";

export type Usuario = {
  id: number;
  documentId: string;
  username: string;
  email: string;
  blocked: boolean;
  createdAt: string;
  role: { name: string; type: string } | null;
};

export type FiltroEstado = "activos" | "desactivados" | "todos";

export const esFiltroEstado = (valor?: string): valor is FiltroEstado =>
  valor === "activos" || valor === "desactivados" || valor === "todos";

// /api/users devuelve un array directo, no { data, meta } como las entidades
export async function obtenerUsuarios(): Promise<Usuario[]> {
  const params = new URLSearchParams({
    populate: "role",
    sort: "username:asc",
    "pagination[pageSize]": "100",
  });

  const respuesta = await fetch(`${API_URL}/api/users?${params}`, {
    headers: { Authorization: `Bearer ${await tokenActual()}` },
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error(`La API respondió ${respuesta.status} en /api/users`);
  }

  return respuesta.json();
}

// La relación está solo del lado del reporte (Reporte.autor), así que no se
// puede pedir desde el usuario: se traen los reportes con su autor y se cuentan.
export async function contarReportesPorUsuario(): Promise<Map<number, number>> {
  const params = new URLSearchParams({
    "fields[0]": "fecha",
    "populate[autor][fields][0]": "username",
    "pagination[pageSize]": "100",
  });
  const token = await tokenActual();
  const cantidades = new Map<number, number>();
  let pagina = 1;
  let totalPaginas = 1;

  do {
    params.set("pagination[page]", String(pagina));
    const respuesta = await fetch(`${API_URL}/api/reportes?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!respuesta.ok) {
      throw new Error(`La API respondió ${respuesta.status} en /api/reportes`);
    }

    const { data, meta } = await respuesta.json();
    for (const reporte of data as { autor: { id: number } | null }[]) {
      if (reporte.autor) {
        cantidades.set(reporte.autor.id, (cantidades.get(reporte.autor.id) ?? 0) + 1);
      }
    }
    totalPaginas = meta.pagination.pageCount;
    pagina++;
  } while (pagina <= totalPaginas);

  return cantidades;
}

export type ResultadoEdicion = { ok: true } | { ok: false; mensaje: string };

// Solo se envían el nombre y el estado: el endpoint de Strapi también
// aceptaría rol o contraseña, y el panel no debe tocarlos.
export async function guardarUsuario(
  id: number,
  cambios: { username: string; blocked: boolean },
): Promise<ResultadoEdicion> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await tokenActual()}`,
      },
      body: JSON.stringify(cambios),
      cache: "no-store",
    });
  } catch {
    return { ok: false, mensaje: "No se pudo conectar con el servidor. Probá de nuevo en unos minutos." };
  }

  if (respuesta.ok) return { ok: true };

  const cuerpo = await respuesta.json().catch(() => null);
  const mensaje: string = cuerpo?.error?.message ?? "";

  if (/username already taken/i.test(mensaje)) {
    return { ok: false, mensaje: "Ya hay otro usuario con ese nombre." };
  }
  if (respuesta.status === 404) {
    return { ok: false, mensaje: "El usuario ya no existe." };
  }
  return { ok: false, mensaje: "No se pudieron guardar los cambios." };
}
