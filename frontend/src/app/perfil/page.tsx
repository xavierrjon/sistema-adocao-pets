"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

function PerfilContent() {
  const { user } = useAuth();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-brand-950">Meu perfil</h1>
      <p className="mt-2 text-slate-600">Dados da sua conta AdoteJá.</p>

      <dl className="mt-8 space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <div>
          <dt className="text-sm font-bold text-slate-500">Nome</dt>
          <dd className="mt-1 text-base font-semibold text-brand-950">{user?.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-bold text-slate-500">E-mail</dt>
          <dd className="mt-1 text-base text-slate-700">{user?.email}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <PerfilContent />
    </ProtectedRoute>
  );
}
