import { Button } from "@/components/ui/Button";
import { PawIcon } from "@/components/ui/icons";

/** Card com aparência do AnimalCard para exibir enquanto os dados carregam. */
export function AnimalCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-slate-100" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-2/5 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-3/5 animate-pulse rounded-full bg-slate-100" />
        <div className="h-9 w-2/5 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

type AnimalsEmptyStateProps = {
  title?: string;
  message?: string;
  onClearFilters?: () => void;
};

export function AnimalsEmptyState({
  title = "Nenhum animal encontrado",
  message = "Tente ajustar a busca ou os filtros para ver mais animais.",
  onClearFilters,
}: AnimalsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-100">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <PawIcon className="h-8 w-8" />
      </span>
      <div className="space-y-1">
        <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
      {onClearFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

type AnimalsErrorStateProps = {
  onRetry?: () => void;
};

export function AnimalsErrorState({ onRetry }: AnimalsErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-100">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-process/10 text-process">
        😿
      </span>
      <div className="space-y-1">
        <h3 className="text-lg font-extrabold text-slate-900">Não foi possível carregar os animais.</h3>
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
