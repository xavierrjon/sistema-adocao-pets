"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthField } from "./AuthField";
import { Button } from "@/components/ui/Button";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from "@/components/ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";
import { detailsToFieldErrors, isApiErrorWithStatus } from "@/lib/form-errors";
import { withNext } from "@/lib/redirect";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export function RegisterForm({ nextPath = "/" }: { nextPath?: string }) {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!name.trim()) {
      errors.name = "Informe seu nome completo.";
    } else if (name.trim().length < 2) {
      errors.name = "O nome deve ter no mínimo 2 caracteres.";
    }

    if (!email.trim()) {
      errors.email = "Informe seu e-mail.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = "Informe um e-mail válido.";
    }

    if (!password) {
      errors.password = "Crie uma senha.";
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirme sua senha.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !validate()) return;

    setFormError(null);
    setIsSubmitting(true);

    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.push(withNext("/login", nextPath));
    } catch (error) {
      if (isApiErrorWithStatus(error, 409)) {
        setFieldErrors({ email: "Este e-mail já está cadastrado." });
      } else if (error instanceof ApiError && error.details) {
        setFieldErrors(detailsToFieldErrors(error));
      } else {
        setFormError(error instanceof Error ? error.message : "Não foi possível criar sua conta.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordToggle = (
    show: boolean,
    toggle: () => void,
    label: string,
  ) => (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={show}
      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      {show ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError ? (
        <p
          role="alert"
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {formError}
        </p>
      ) : null}

      <AuthField
        id="register-name"
        label="Nome completo"
        type="text"
        autoComplete="name"
        placeholder="Seu nome"
        icon={<UserIcon className="h-5 w-5" />}
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={fieldErrors.name}
      />

      <AuthField
        id="register-email"
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@email.com"
        icon={<MailIcon className="h-5 w-5" />}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
      />

      <AuthField
        id="register-password"
        label="Senha"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Mínimo de 8 caracteres"
        icon={<LockIcon className="h-5 w-5" />}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        trailing={passwordToggle(
          showPassword,
          () => setShowPassword((visible) => !visible),
          showPassword ? "Ocultar senha" : "Mostrar senha",
        )}
      />

      <AuthField
        id="register-confirm-password"
        label="Confirmar senha"
        type={showConfirmation ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Repita sua senha"
        icon={<LockIcon className="h-5 w-5" />}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={fieldErrors.confirmPassword}
        trailing={passwordToggle(
          showConfirmation,
          () => setShowConfirmation((visible) => !visible),
          showConfirmation ? "Ocultar confirmação" : "Mostrar confirmação",
        )}
      />

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Já tem uma conta?{" "}
        <Link
          href={withNext("/login", nextPath)}
          className="font-bold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
