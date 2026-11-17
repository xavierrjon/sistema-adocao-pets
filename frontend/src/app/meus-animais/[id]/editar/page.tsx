"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AnimalForm, type AnimalFormPayload } from "@/components/animals/AnimalForm";
import {
  AnimalDetailsError,
  AnimalDetailsLoading,
  AnimalDetailsNotFound,
} from "@/components/animals/AnimalDetailsStates";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";
import { getAnimalById, updateAnimal } from "@/services/animals";
import type { Animal } from "@/types/animal";

type EditState =
  | { status: "loading" }
  | { status: "found"; animal: Animal }
  | { status: "notFound" }
  | { status: "error" };

function EditAnimalContent() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<EditState>({ status: "loading" });

  const loadAnimal = useCallback(() => {
    setState({ status: "loading" });

    getAnimalById(id)
      .then((animal) => {
        // Checagem apenas de experiência: a autorização real é feita pela API.
        if (animal.userId !== user?.id) {
          setState({ status: "notFound" });
          return;
        }

        setState({ status: "found", animal });
      })
      .catch((error: unknown) => {
        setState(
          error instanceof ApiError && (error.status === 404 || error.status === 400)
            ? { status: "notFound" }
            : { status: "error" },
        );
      });
  }, [id, user?.id]);

  useEffect(loadAnimal, [loadAnimal]);

  async function handleSubmit(values: AnimalFormPayload) {
    await updateAnimal(id, values);
    router.push("/meus-animais?feedback=atualizado");
  }

  if (state.status === "loading") {
    return <AnimalDetailsLoading />;
  }

  if (state.status === "notFound") {
    return <AnimalDetailsNotFound />;
  }

  if (state.status === "error") {
    return <AnimalDetailsError onRetry={loadAnimal} />;
  }

  const { animal } = state;

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
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-950">Editar anúncio</h1>
        <p className="text-slate-600">Atualize as informações de {animal.name}.</p>
      </header>

      <div className="mt-8">
        <AnimalForm
          initialAnimal={animal}
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default function EditAnimalPage() {
  return (
    <ProtectedRoute>
      <EditAnimalContent />
    </ProtectedRoute>
  );
}
