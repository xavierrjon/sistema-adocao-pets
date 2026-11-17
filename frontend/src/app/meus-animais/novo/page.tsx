"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AnimalForm, type AnimalFormPayload } from "@/components/animals/AnimalForm";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { createAnimal } from "@/services/animals";

function NewAnimalContent() {
  const router = useRouter();

  async function handleSubmit(values: AnimalFormPayload) {
    await createAnimal({ ...values, whatsapp: values.whatsapp ?? "" });
    router.push("/meus-animais?feedback=cadastrado");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/meus-animais"
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para meus animais
      </Link>

      <header className="mt-6 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-950">Cadastrar animal</h1>
        <p className="text-slate-600">
          Preencha as informações do animal para publicar o anúncio de adoção.
        </p>
      </header>

      <div className="mt-8">
        <AnimalForm
          submitLabel="Cadastrar animal"
          submittingLabel="Cadastrando..."
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default function NewAnimalPage() {
  return (
    <ProtectedRoute>
      <NewAnimalContent />
    </ProtectedRoute>
  );
}
