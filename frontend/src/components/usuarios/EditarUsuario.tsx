"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { editarUsuario, type EstadoEdicion } from "@/lib/acciones-usuarios";
import type { Usuario } from "@/lib/usuarios";
import { useActionState, useEffect, useState } from "react";

const ESTADO_INICIAL: EstadoEdicion = { error: null, guardado: false };

type Props = {
  usuario: Pick<Usuario, "id" | "username" | "email" | "blocked">;
  // El administrador no puede desactivarse a sí mismo
  esUnoMismo: boolean;
};

export default function EditarUsuario({ usuario, esUnoMismo }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-theme-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/3"
      >
        Editar
      </button>

      <Modal isOpen={abierto} onClose={() => setAbierto(false)} className="m-4 max-w-md">
        {/* Se monta de nuevo cada vez que se abre, así arranca con los datos actuales */}
        {abierto && (
          <Formulario
            usuario={usuario}
            esUnoMismo={esUnoMismo}
            alGuardar={() => setAbierto(false)}
          />
        )}
      </Modal>
    </>
  );
}

function Formulario({
  usuario,
  esUnoMismo,
  alGuardar,
}: Props & { alGuardar: () => void }) {
  const [estado, enviar, enviando] = useActionState(editarUsuario, ESTADO_INICIAL);
  const [activo, setActivo] = useState(!usuario.blocked);

  useEffect(() => {
    if (estado.guardado) alGuardar();
  }, [estado.guardado, alGuardar]);

  return (
    <form action={enviar} className="p-6 sm:p-8">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Editar usuario
      </h4>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        {usuario.email}
      </p>

      <input type="hidden" name="id" value={usuario.id} />
      <input type="hidden" name="activo" value={activo ? "si" : "no"} />

      <div className="mt-6 space-y-5">
        <div>
          <Label htmlFor={`username-${usuario.id}`}>Nombre de usuario</Label>
          <Input
            id={`username-${usuario.id}`}
            name="username"
            defaultValue={usuario.username}
            autoComplete="off"
          />
        </div>

        <div>
          <Switch
            label={activo ? "Activo" : "Desactivado"}
            defaultChecked={activo}
            disabled={esUnoMismo}
            onChange={setActivo}
          />
          <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
            {esUnoMismo
              ? "No podés desactivar tu propia cuenta."
              : "Un usuario desactivado no puede iniciar sesión en SnapIt."}
          </p>
        </div>

        {estado.error && (
          <p
            role="alert"
            className="rounded-lg bg-error-50 px-4 py-3 text-theme-sm text-error-600 dark:bg-error-500/15 dark:text-error-400"
          >
            {estado.error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          {/* El Button del template no acepta type y dentro de un form enviaría */}
          <button
            type="button"
            onClick={alGuardar}
            disabled={enviando}
            className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/3"
          >
            Cancelar
          </button>
          <Button size="sm" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </form>
  );
}
