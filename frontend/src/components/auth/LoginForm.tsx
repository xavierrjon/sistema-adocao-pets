"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthField } from "./AuthField";
import { Button } from "@/components/ui/Button";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "@/components/ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import { isApiErrorWithStatus } from "@/lib/form-errors";
import { withNext } from "@/lib/redirect";

type FieldErrors = {
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export function LoginForm({ nextPath = "/" }: { nextPath?: string }) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = "Informe seu e-mail.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = "Informe um e-mail válido.";
    }

    if (!password) {
      errors.password = "Informe sua senha.";
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
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
      await login({ email: email.trim(), password, rememberMe });
      router.push(nextPath);
    } catch (error) {
      if (isApiErrorWithStatus(error, 401)) {
        setFormError("E-mail ou senha inválidos.");
      } else if (isApiErrorWithStatus(error, 429)) {
        setFormError("Muitas tentativas de login. Tente novamente em alguns minutos.");
      } else {
        setFormError(error instanceof Error ? error.message : "Não foi possível entrar.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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
        id="login-email"
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
        id="login-password"
        label="Senha"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Sua senha"
        icon={<LockIcon className="h-5 w-5" />}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        }
      />

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 accent-brand-600"
        />
        Lembrar de mim
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Ainda não tem conta?{" "}
        <Link
          href={withNext("/cadastro", nextPath)}
          className="font-bold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
