import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, PawIcon } from "@/components/ui/icons";

export function AnimalDetailsLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      <p role="status" className="text-sm font-semibold text-brand-700">
        Carregando animais...
      </p>
      <div className="mt-4 h-4 w-20 rounded-full bg-slate-200" aria-hidden="true" />
      <div className="mt-6 aspect-[16/9] w-full rounded-3xl bg-slate-200" aria-hidden="true" />
      <div className="mt-8 space-y-3" aria-hidden="true">
        <div className="h-9 w-1/3 rounded-full bg-slate-200" />
        <div className="h-5 w-1/4 rounded-full bg-slate-200" />
        <div className="h-6 w-40 rounded-full bg-slate-200" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-16 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="mt-8 space-y-3" aria-hidden="true">
        <div className="h-7 w-1/3 rounded-full bg-slate-200" />
        <div className="h-4 w-full rounded-full bg-slate-200" />
        <div className="h-4 w-5/6 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/animais"
      className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      Voltar
    </Link>
  );
}

export function AnimalDetailsNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-4 py-20 text-center sm:px-6 lg:px-8">
      <BackLink />
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <PawIcon className="h-8 w-8" />
      </span>
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-brand-950">Animal não encontrado</h1>
        <p className="text-sm text-slate-500">
          O animal que você procura não está disponível ou foi removido.
        </p>
      </div>
    </div>
  );
}

export function AnimalDetailsError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-4 py-20 text-center sm:px-6 lg:px-8">
      <BackLink />
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-process/10 text-process">
        😿
      </span>
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-brand-950">
          Não foi possível carregar os detalhes do animal.
        </h1>
        <p className="text-sm text-slate-500">Verifique sua conexão e tente novamente em instantes.</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
