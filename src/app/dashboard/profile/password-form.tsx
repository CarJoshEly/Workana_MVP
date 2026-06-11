"use client";

import { changePassword } from "@/lib/actions/profile.actions";
import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";

type PasswordState = {
  success: boolean;
  message: string;
};

const initialState: PasswordState = {
  success: false,
  message: "",
};

async function submitPassword(
  _state: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const result = await changePassword(formData);
  return result ?? initialState;
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(submitPassword, initialState);
  const [visible, setVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  function toggle(field: keyof typeof visible) {
    setVisible((current) => ({ ...current, [field]: !current[field] }));
  }

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Cambiar contrasena</h2>
        <p className="text-sm text-gray-500">Usa al menos 6 caracteres.</p>
      </div>

      <PasswordInput
        id="currentPassword"
        label="Contrasena actual"
        name="currentPassword"
        visible={visible.current}
        onToggle={() => toggle("current")}
      />

      <PasswordInput
        id="newPassword"
        label="Nueva contrasena"
        name="newPassword"
        visible={visible.next}
        onToggle={() => toggle("next")}
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirmar contrasena"
        name="confirmPassword"
        visible={visible.confirm}
        onToggle={() => toggle("confirm")}
      />

      {state.message && (
        <p
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            state.success
              ? "bg-green-50 text-[#1A9B5E]"
              : "bg-red-50 text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Actualizando..." : "Actualizar contrasena"}
      </button>
    </form>
  );
}

type PasswordInputProps = {
  id: string;
  label: string;
  name: string;
  visible: boolean;
  onToggle: () => void;
};

function PasswordInput({ id, label, name, visible, onToggle }: PasswordInputProps) {
  const Icon = visible ? EyeOff : Eye;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          minLength={name === "currentPassword" ? undefined : 6}
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
          aria-label={visible ? "Ocultar contrasena" : "Ver contrasena"}
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
