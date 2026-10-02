// Sesión del panel contra Users & Permissions de Strapi.
// Se usa solo del lado del servidor (proxy, layouts y server actions): los
// tokens viajan en cookies httpOnly que el navegador no puede leer.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337";

export const COOKIE_TOKEN = "snapit_token";
export const COOKIE_REFRESH = "snapit_refresh";

// Nombre de la cookie en la que Strapi devuelve el refresh token
const COOKIE_REFRESH_STRAPI = "strapi_up_refresh";

const ROL_PERMITIDO = "administrador";

export type Tokens = { token: string; refresh: string };

export type UsuarioSesion = {
  id: number;
  username: string;
  email: string;
  rol: string;
};

export type ResultadoLogin =
  | { ok: true; tokens: Tokens }
  | { ok: false; motivo: "credenciales" | "bloqueado" | "sin-conexion" };

// Con sessions.httpOnly, Strapi no manda el refresh token en el cuerpo sino en una cookie
function refreshDe(respuesta: Response): string | null {
  for (const cookie of respuesta.headers.getSetCookie()) {
    const [par] = cookie.split(";");
    const [nombre, valor] = par.split("=");
    if (nombre.trim() === COOKIE_REFRESH_STRAPI && valor) return valor;
  }
  return null;
}

export async function loginEnStrapi(
  identificador: string,
  password: string,
): Promise<ResultadoLogin> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: identificador, password }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, motivo: "sin-conexion" };
  }

  const cuerpo = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const mensaje: string = cuerpo?.error?.message ?? "";
    return {
      ok: false,
      motivo: /blocked/i.test(mensaje) ? "bloqueado" : "credenciales",
    };
  }

  const refresh = refreshDe(respuesta);
  if (!cuerpo?.jwt || !refresh) return { ok: false, motivo: "credenciales" };

  return { ok: true, tokens: { token: cuerpo.jwt, refresh } };
}

// Devuelve el usuario solo si el token es válido y su rol puede usar el panel
export async function usuarioAdministrador(
  token: string,
): Promise<UsuarioSesion | null> {
  try {
    const respuesta = await fetch(`${API_URL}/api/users/me?populate=role`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!respuesta.ok) return null;

    const usuario = await respuesta.json();
    if (usuario?.role?.type !== ROL_PERMITIDO) return null;

    return {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.role.name,
    };
  } catch {
    return null;
  }
}

// Pide un token nuevo; Strapi también rota el refresh token
export async function renovarTokens(refresh: string): Promise<Tokens | null> {
  try {
    const respuesta = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: "no-store",
    });
    if (!respuesta.ok) return null;

    const { jwt } = await respuesta.json();
    const nuevoRefresh = refreshDe(respuesta);
    if (!jwt || !nuevoRefresh) return null;

    return { token: jwt, refresh: nuevoRefresh };
  } catch {
    return null;
  }
}

// Cierra la sesión en Strapi. Si falla, igual se borran las cookies.
export async function logoutEnStrapi(token: string): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    // Sin conexión no hay nada más que hacer
  }
}

// El token de acceso dura 10 minutos; se renueva un poco antes de que venza
export function tokenVencido(token: string | undefined, margenSegundos = 30): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    return payload.exp * 1000 < Date.now() + margenSegundos * 1000;
  } catch {
    return true;
  }
}

export const opcionesCookie = (maxAgeSegundos: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: maxAgeSegundos,
});

export const DURACION_TOKEN = 10 * 60;
export const DURACION_REFRESH = 14 * 24 * 60 * 60;
