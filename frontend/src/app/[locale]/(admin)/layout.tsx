import PanelAdmin from "@/layout/PanelAdmin";
import { COOKIE_TOKEN, usuarioAdministrador } from "@/lib/sesion";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

// Todas las páginas del panel pasan por acá: sin un administrador con
// sesión válida en Strapi, se vuelve al inicio de sesión.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(COOKIE_TOKEN)?.value;
  const usuario = token ? await usuarioAdministrador(token) : null;

  if (!usuario) redirect("/signin");

  return (
    <PanelAdmin usuario={{ username: usuario.username, rol: usuario.rol }}>
      {children}
    </PanelAdmin>
  );
}
