"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { iniciarSesion, type EstadoLogin } from "@/lib/acciones-sesion";
import { useActionState, useState } from "react";

const ESTADO_INICIAL: EstadoLogin = { error: null, identificador: "" };

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [estado, enviar, enviando] = useActionState(iniciarSesion, ESTADO_INICIAL);

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              El panel de SnapIt es solo para administradores.
            </p>
          </div>

          <form action={enviar} noValidate>
            <div className="space-y-6">
              <div>
                <Label htmlFor="identificador">
                  Email o usuario <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="identificador"
                  name="identificador"
                  autoComplete="username"
                  placeholder="admin@snapit.test"
                  defaultValue={estado.identificador}
                  error={Boolean(estado.error)}
                />
              </div>
              <div>
                <Label htmlFor="password">
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    error={Boolean(estado.error)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="inset-e-4 absolute top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {estado.error && (
                <p
                  role="alert"
                  className="rounded-lg bg-error-50 px-4 py-3 text-theme-sm text-error-600 dark:bg-error-500/15 dark:text-error-400"
                >
                  {estado.error}
                </p>
              )}

              <div>
                <Button className="w-full" size="sm" disabled={enviando}>
                  {enviando ? "Ingresando..." : "Ingresar"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
