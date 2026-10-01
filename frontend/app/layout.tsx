import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panel de SnapIt",
  description: "Frontend base para probar el template CSS",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
