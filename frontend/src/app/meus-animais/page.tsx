"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DeleteAnimalDialog } from "@/components/animals/DeleteAnimalDialog";
import { MyAnimalCard } from "@/components/animals/MyAnimalCard";
import { PawIcon } from "@/components/ui/icons";
import { Button, buttonClasses } from "@/components/ui/Button";
import { isApiErrorWithStatus } from "@/lib/form-errors";
import { deleteAnimal, listMyAnimals } from "@/services/animals";
import type { Animal } from "@/types/animal";

const FEEDBACK_MESSAGES = {
  cadastrado: "Animal cadastrado com sucesso.",
  atualizado: "Anúncio atualizado com sucesso.",
  excluido: "Anúncio excluído com sucesso.",
} as const;

type FeedbackKey = keyof typeof FEEDBACK_MESSAGES;

function readFeedback(value: string | null): FeedbackKey | null {
  return value === "cadastrado" || value === "atualizado" || value === "excluido" ? value : null;
}

function MyAnimalsContent() {
  const searchParams = useSearchParams();
  const feedbackParam = readFeedback(searchParams.get("feedback"));

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadAnimals = useCallback(() => {
    setIsLoading(true);
    setHasError(false);

    listMyAnimals()
      .then(setAnimals)
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(loadAnimals, [loadAnimals]);

  function openDeleteDialog(animal: Animal) {
    setAnimalToDelete(animal);
    setDeleteError(null);
  }

  function closeDeleteDialog() {
    // Evita fechar o diálogo no meio de uma exclusão em andamento.
    if (deletingId) return;

    setAnimalToDelete(null);
    setDeleteError(null);
  }

  async function handleDeleteConfirm() {
    if (!animalToDelete || deletingId) return;

    setDeleteError(null);
    setDeletingId(animalToDelete.id);

    try {
      await deleteAnimal(animalToDelete.id);
      setAnimals((current) => current.filter((animal) => animal.id !== animalToDelete.id));
      setAnimalToDelete(null);
      setDeleteError(null);
      setSuccessMessage(FEEDBACK_MESSAGES.excluido);
    } catch (error) {
      if (isApiErrorWithStatus(error, 401)) {
        setDeleteError("Sua sessão expirou. Faça login novamente para excluir o anúncio.");
      } else {
        setDeleteError(
          error instanceof Error && error.message
            ? error.message
            : "Não foi possível excluir o anúncio. Tente novamente.",
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  const feedbackMessage = successMessage ?? (feedbackParam ? FEEDBACK_MESSAGES[feedbackParam] : null);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-950">Meus animais</h1>
          <p className="mt-2 text-slate-600">Anúncios cadastrados com a sua conta.</p>
        </div>

        <Link href="/meus-animais/novo" className={buttonClasses({ size: "md" })}>
          <PawIcon className="h-4 w-4" />
          Cadastrar animal
        </Link>
      </div>

      {feedbackMessage ? (
        <p
          role="status"
          className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800"
        >
          {feedbackMessage}
        </p>
      ) : null}

      <div className="mt-8">
        {isLoading ? (
          <MyAnimalsSkeleton />
        ) : hasError ? (
          <div className="space-y-3 rounded-2xl bg-red-50 px-4 py-3">
            <p role="alert" className="text-sm font-semibold text-red-700">
              Não foi possível carregar seus animais.
            </p>
            <p className="text-sm text-red-600">Verifique sua conexão e tente novamente em instantes.</p>
            <Button variant="outline" size="sm" onClick={loadAnimals}>
              Tentar novamente
            </Button>
          </div>
        ) : animals.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-100">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <PawIcon className="h-8 w-8" />
            </span>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">
                Você ainda não cadastrou nenhum animal
              </h3>
              <p className="text-sm text-slate-500">
                Cadastre um animal para encontrar um novo lar para ele.
              </p>
            </div>
            <Link href="/meus-animais/novo" className={buttonClasses({ size: "sm" })}>
              Cadastrar animal
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {animals.map((animal) => (
              <MyAnimalCard key={animal.id} animal={animal} onOpenDelete={openDeleteDialog} />
            ))}
          </ul>
        )}
      </div>

      {animalToDelete ? (
        <DeleteAnimalDialog
          animal={animalToDelete}
          isDeleting={Boolean(deletingId)}
          error={deleteError}
          onConfirm={handleDeleteConfirm}
          onCancel={closeDeleteDialog}
        />
      ) : null}
    </div>
  );
}

function MyAnimalsSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      {[0, 1, 2].map((index) => (
        <div key={index} className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
          <div className="h-5 w-1/3 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
      <p role="status" className="sr-only">
        Carregando seus animais...
      </p>
    </div>
  );
}

function MyAnimalsFallback() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p role="status" className="text-sm text-slate-500">
        Carregando seus animais...
      </p>
    </div>
  );
}

export default function MyAnimalsPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<MyAnimalsFallback />}>
        <MyAnimalsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
