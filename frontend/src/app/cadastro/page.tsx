import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GuestOnlyRoute } from "@/components/auth/GuestOnlyRoute";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Criar conta | AdoteJá",
  description: "Crie sua conta AdoteJá e ajude um animal a encontrar um novo lar.",
};

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Junte-se à comunidade AdoteJá e faça parte de histórias de adoção responsável."
    >
      <GuestOnlyRoute>
        <RegisterForm nextPath={safeNextPath(next)} />
      </GuestOnlyRoute>
    </AuthLayout>
  );
}
