"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { withNext } from "@/lib/redirect";
import { getAnimalContact } from "@/services/animals";
import type { AnimalContact } from "@/types/animal";

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}

export function AdoptionContact({ animalId, animalName }: { animalId: string; animalName: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [contact, setContact] = useState<AnimalContact | null>(null);
  const [isFetchingContact, setIsFetchingContact] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = `/animais/${animalId}`;
  const isBusy = isLoading || isFetchingContact;

  async function handleAdopt() {
    if (isBusy) return;

    if (!isAuthenticated) {
      router.push(withNext("/login", nextPath));
      return;
    }

    if (contact) return;

    setError(null);
    setIsFetchingContact(true);

    try {
      setContact(await getAnimalContact(animalId));
    } catch {
      setError("Não foi possível carregar o contato do responsável. Tente novamente.");
    } finally {
      setIsFetchingContact(false);
    }
  }

  const whatsappDigits = contact?.whatsapp.replace(/\D/g, "") ?? "";
  const message = encodeURIComponent(`Olá! Tenho interesse em adotar ${animalName}.`);

  return (
    <div className="space-y-4">
      <Button size="lg" className="w-full sm:w-auto" onClick={handleAdopt} disabled={isBusy} aria-busy={isBusy}>
        {isFetchingContact ? "Carregando contato..." : "Quero adotar 🐾"}
      </Button>

      {!isLoading && !isAuthenticated ? (
        <div className="max-w-xl rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-brand-950">
            Entre na sua conta para entrar em contato com o responsável por este animal.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href={withNext("/login", nextPath)}
              className={buttonClasses({ size: "sm" })}
            >
              Entrar
            </Link>
            <Link
              href={withNext("/cadastro", nextPath)}
              className={buttonClasses({ variant: "outline", size: "sm" })}
            >
              Criar conta
            </Link>
          </div>
        </div>
      ) : null}

      {isAuthenticated && !contact && !error ? (
        <p className="text-sm text-slate-500">
          Clique no botão acima para liberar o contato do responsável.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      {contact ? (
        <div className="max-w-xl rounded-2xl border border-brand-100 bg-white px-4 py-3" aria-live="polite">
          <p className="text-sm font-bold text-brand-950">
            Responsável: {contact.responsibleName}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            WhatsApp: {formatWhatsapp(contact.whatsapp)}
          </p>
          <a
            href={`https://wa.me/${whatsappDigits}?text=${message}`}
            target="_blank"
            rel="noreferrer"
            className={buttonClasses({ size: "sm", className: "mt-3" })}
          >
            Falar no WhatsApp
          </a>
        </div>
      ) : null}
    </div>
  );
}
