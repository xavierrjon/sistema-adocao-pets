"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchIcon } from "@/components/ui/icons";

type SearchBarProps = {
  /** Valor controlado (opcional) para uso em páginas que filtram em memória. */
  value?: string;
  onChange?: (value: string) => void;
  /** Chamado ao enviar o formulário; sem ele, navega para `/animais?q=...`. */
  onSubmit?: (query: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Buscar por nome, raça ou espécie...",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [internalValue, setInternalValue] = useState("");

  const isControlled = value !== undefined;
  const query = isControlled ? value : internalValue;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (onSubmit) {
      onSubmit(query);
      return;
    }

    const trimmed = query.trim();
    router.push(trimmed ? `/animais?q=${encodeURIComponent(trimmed)}` : "/animais");
  }

  function handleChange(nextValue: string) {
    if (isControlled) {
      onChange?.(nextValue);
    } else {
      setInternalValue(nextValue);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Buscar animais"
      className={`flex flex-col gap-3 sm:flex-row ${className}`}
    >
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <Input
          type="search"
          name="q"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={placeholder}
          aria-label="Buscar por nome, raça ou espécie"
          className="pl-11 pr-5"
        />
      </div>
      <Button type="submit" variant="primary" className="sm:self-auto">
        Buscar
      </Button>
    </form>
  );
}
