import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GuestOnlyRoute } from "@/components/auth/GuestOnlyRoute";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Entrar | AdoteJá",
  description: "Acesse sua conta AdoteJá para acompanhar seus animais e adoções.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Que bom ter você de volta! Entre para continuar cuidando de quem precisa de um lar."
    >
      <GuestOnlyRoute>
        <LoginForm nextPath={safeNextPath(next)} />
      </GuestOnlyRoute>
    </AuthLayout>
  );
}
