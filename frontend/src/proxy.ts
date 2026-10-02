import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import {
  COOKIE_REFRESH,
  COOKIE_TOKEN,
  DURACION_REFRESH,
  DURACION_TOKEN,
  opcionesCookie,
  renovarTokens,
  tokenVencido,
} from "./lib/sesion";

const intl = createMiddleware(routing);

// Única página a la que se puede entrar sin sesión
const RUTA_LOGIN = "/signin";

function irAlLogin(request: NextRequest) {
  const respuesta = NextResponse.redirect(new URL(RUTA_LOGIN, request.url));
  respuesta.cookies.delete(COOKIE_TOKEN);
  respuesta.cookies.delete(COOKIE_REFRESH);
  return respuesta;
}

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === RUTA_LOGIN) return intl(request);

  const token = request.cookies.get(COOKIE_TOKEN)?.value;
  const refresh = request.cookies.get(COOKIE_REFRESH)?.value;

  if (!refresh) return irAlLogin(request);

  // El token dura 10 minutos: si venció, se pide uno nuevo con el refresh token
  // y se vuelve a cargar la misma URL, para que la página ya reciba las cookies nuevas.
  // Que el usuario sea administrador lo verifica el layout del panel.
  if (tokenVencido(token)) {
    const tokens = await renovarTokens(refresh);
    if (!tokens) return irAlLogin(request);

    const respuesta = NextResponse.redirect(request.nextUrl);
    respuesta.cookies.set(COOKIE_TOKEN, tokens.token, opcionesCookie(DURACION_TOKEN));
    respuesta.cookies.set(COOKIE_REFRESH, tokens.refresh, opcionesCookie(DURACION_REFRESH));
    return respuesta;
  }

  return intl(request);
}

export const config = {
  matcher: ["/((?!api/|_next|_vercel|.*\\..*).*)"],
};
