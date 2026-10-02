"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { esEstado } from "./filtros";
import { COOKIE_TOKEN, usuarioAdministrador } from "./sesion";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337";

export type EstadoCambio = { error: string | null };

export async function cambiarEstadoIncidente(
  _anterior: EstadoCambio,
  datos: FormData,
): Promise<EstadoCambio> {
  const documentId = String(datos.get("documentId") ?? "");
  const estado = String(datos.get("estado") ?? "");
  const estadoAnterior = String(datos.get("estadoAnterior") ?? "");

  if (!documentId || !esEstado(estado)) {
    return { error: "El estado elegido no es válido." };
  }
  if (estado === estadoAnterior) return { error: null };

  // Las server actions se pueden llamar directo, así que se vuelve a verificar la sesión
  const token = (await cookies()).get(COOKIE_TOKEN)?.value;
  if (!token || !(await usuarioAdministrador(token))) {
    return { error: "Tu sesión venció. Volvé a iniciar sesión." };
  }

  // La fecha de cierre acompaña al estado: se completa al cerrar y se borra al
  // reabrir, así el promedio de resolución de los indicadores sigue siendo correcto
  const fechaCierre =
    estado === "cerrado" ? new Date().toISOString() : null;

  try {
    const respuesta = await fetch(`${API_URL}/api/incidentes/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: { estado, fechaCierre } }),
      cache: "no-store",
    });

    if (respuesta.status === 404) return { error: "El incidente ya no existe." };
    if (!respuesta.ok) return { error: "No se pudo cambiar el estado." };
  } catch {
    return { error: "No se pudo conectar con el servidor." };
  }

  // Cambia el listado, la ficha y los indicadores de Inicio
  revalidatePath("/", "layout");
  return { error: null };
}
