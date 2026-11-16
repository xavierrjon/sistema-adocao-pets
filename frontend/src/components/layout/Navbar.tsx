"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CloseIcon, MenuIcon, PawIcon } from "@/components/ui/icons";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/animais", label: "Animais" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  function isLinkActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function linkClasses(href: string) {
    return [
      "rounded-full px-4 py-2 text-sm font-bold transition",
      isLinkActive(href)
        ? "bg-brand-50 text-brand-700"
        : "text-slate-600 hover:bg-brand-50 hover:text-brand-700",
    ].join(" ");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          aria-label="AdoteJá — página inicial"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <PawIcon className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-brand-950">
            Adote<span className="text-brand-600">Já</span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClasses(href)} aria-current={isLinkActive(href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
          {/* Espaço reservado para a autenticação (etapa futura). */}
          <Button variant="outline" size="sm" className="ml-3" title="Disponível em breve">
            Entrar
          </Button>
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 md:hidden"
        >
          {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Navegação principal (mobile)"
          className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`${linkClasses(href)} flex w-full`}
                  aria-current={isLinkActive(href) ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              {/* Espaço reservado para a autenticação (etapa futura). */}
              <Button variant="outline" size="sm" className="w-full" title="Disponível em breve">
                Entrar
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
