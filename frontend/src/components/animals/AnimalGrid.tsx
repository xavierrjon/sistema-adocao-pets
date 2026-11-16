import { AnimalCard, type AnimalCardProps } from "./AnimalCard";
import { AnimalCardSkeleton } from "./AnimalStates";

type AnimalGridProps = {
  animals: AnimalCardProps[];
  /** Exibe skeletons no lugar dos cards enquanto os dados carregam. */
  isLoading?: boolean;
  /** Quantidade de skeletons exibidos durante o carregamento. */
  loadingCount?: number;
};

export function AnimalGrid({ animals, isLoading = false, loadingCount = 6 }: AnimalGridProps) {
  if (isLoading) {
    return (
      <div>
        <p role="status" className="sr-only">
          Carregando animais...
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: loadingCount }, (_, index) => (
            <AnimalCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {animals.map((animal) => (
        <AnimalCard key={animal.id} {...animal} />
      ))}
    </div>
  );
}
