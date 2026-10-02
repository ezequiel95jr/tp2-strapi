import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión | SnapIt",
  description: "Acceso al panel de incidentes de la vía pública",
};

export default function SignIn() {
  return <SignInForm />;
}
