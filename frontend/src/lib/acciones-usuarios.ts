"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { COOKIE_TOKEN, usuarioAdministrador } from "./sesion";
import { guardarUsuario } from "./usuarios";

export type EstadoEdicion = {
  error: string | null;
  guardado: boolean;
};

// El mínimo que exige Strapi para username
const LARGO_MINIMO = 3;

export async function editarUsuario(
  _anterior: EstadoEdicion,
  datos: FormData,
): Promise<EstadoEdicion> {
  const id = Number(datos.get("id"));
  const username = String(datos.get("username") ?? "").trim();
  const activo = datos.get("activo") === "si";

  if (username.length < LARGO_MINIMO) {
    return { error: `El nombre tiene que tener al menos ${LARGO_MINIMO} caracteres.`, guardado: false };
  }

  // Las server actions se pueden llamar directo, así que se vuelve a verificar la sesión
  const token = (await cookies()).get(COOKIE_TOKEN)?.value;
  const administrador = token ? await usuarioAdministrador(token) : null;
  if (!administrador) {
    return { error: "Tu sesión venció. Volvé a iniciar sesión.", guardado: false };
  }

  if (id === administrador.id && !activo) {
    return { error: "No podés desactivar tu propia cuenta.", guardado: false };
  }

  const resultado = await guardarUsuario(id, { username, blocked: !activo });
  if (!resultado.ok) return { error: resultado.mensaje, guardado: false };

  // El nombre también se ve en el encabezado, así que se refresca todo el panel
  revalidatePath("/", "layout");
  return { error: null, guardado: true };
}
