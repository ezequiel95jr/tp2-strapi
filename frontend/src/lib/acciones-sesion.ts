"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_REFRESH,
  COOKIE_TOKEN,
  DURACION_REFRESH,
  DURACION_TOKEN,
  loginEnStrapi,
  logoutEnStrapi,
  opcionesCookie,
  usuarioAdministrador,
} from "./sesion";

export type EstadoLogin = {
  error: string | null;
  identificador: string;
};

const MENSAJES = {
  vacio: "Completá el email y la contraseña.",
  credenciales: "El email o la contraseña no son correctos.",
  bloqueado: "Tu cuenta está bloqueada. Consultá con un administrador.",
  "sin-conexion": "No se pudo conectar con el servidor. Probá de nuevo en unos minutos.",
  "sin-permiso": "Solo los administradores pueden entrar al panel.",
};

export async function iniciarSesion(
  _anterior: EstadoLogin,
  datos: FormData,
): Promise<EstadoLogin> {
  const identificador = String(datos.get("identificador") ?? "").trim();
  const password = String(datos.get("password") ?? "");

  if (!identificador || !password) {
    return { error: MENSAJES.vacio, identificador };
  }

  const login = await loginEnStrapi(identificador, password);
  if (!login.ok) return { error: MENSAJES[login.motivo], identificador };

  const usuario = await usuarioAdministrador(login.tokens.token);
  if (!usuario) {
    // Un vecino u operador sí existe en Strapi, pero no puede usar el panel
    return { error: MENSAJES["sin-permiso"], identificador };
  }

  const almacen = await cookies();
  almacen.set(COOKIE_TOKEN, login.tokens.token, opcionesCookie(DURACION_TOKEN));
  almacen.set(COOKIE_REFRESH, login.tokens.refresh, opcionesCookie(DURACION_REFRESH));

  redirect("/");
}

export async function cerrarSesion(): Promise<void> {
  const almacen = await cookies();
  const token = almacen.get(COOKIE_TOKEN)?.value;

  if (token) await logoutEnStrapi(token);

  almacen.delete(COOKIE_TOKEN);
  almacen.delete(COOKIE_REFRESH);

  redirect("/signin");
}
