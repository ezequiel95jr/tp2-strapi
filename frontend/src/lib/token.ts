import { cookies } from "next/headers";
import { COOKIE_TOKEN } from "./sesion";

// Token del administrador que inició sesión, para los pedidos que no son públicos
export async function tokenActual(): Promise<string> {
  const token = (await cookies()).get(COOKIE_TOKEN)?.value;
  // El layout del panel ya redirige al login si falta; esto no debería pasar
  if (!token) throw new Error("No hay una sesión iniciada");
  return token;
}
