"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ChevronDownIcon, CloseIcon, MenuIcon, UserIcon } from "@/components/ui/icons";
import { useAuth } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/animais", label: "Animais" },
];

const ACCOUNT_LINKS = [
  { href: "/meus-animais", label: "Meus animais" },
  { href: "/perfil", label: "Meu perfil" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Fecha os menus ao trocar de página para não deixar itens flutuantes.
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen]);

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

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
      setIsMenuOpen(false);
      setIsAccountMenuOpen(false);
      router.push("/");
    } catch {
      setLogoutError("Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const firstName = user?.name.trim().split(" ")[0] ?? "Usuário";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          aria-label="AdoteJá — página inicial"
        >
          <BrandLogo />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClasses(href)} aria-current={isLinkActive(href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {isLoading ? (
            <span aria-hidden="true" className="block h-9 w-24 animate-pulse rounded-full bg-slate-100" />
          ) : isAuthenticated ? (
            <>
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((open) => !open)}
                  aria-label={`Olá, ${firstName}. Abrir menu do usuário`}
                  aria-expanded={isAccountMenuOpen}
                  aria-controls="account-menu"
                  className="flex items-center gap-2 rounded-full p-1 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700"
                  >
                    <UserIcon className="h-5 w-5" />
                  </span>
                  <span className="hidden text-sm font-semibold text-brand-800 sm:inline">
                    Olá, {firstName}
                  </span>
                  <ChevronDownIcon
                    className={`hidden h-4 w-4 text-brand-700 transition-transform sm:block ${
                      isAccountMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isAccountMenuOpen ? (
                  <nav
                    id="account-menu"
                    aria-label="Menu do usuário"
                    className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-900/10"
                  >
                    <ul className="flex flex-col gap-1">
                      {ACCOUNT_LINKS.map(({ href, label }) => (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="block rounded-xl px-4 py-2.5 text-sm font-bold text-brand-800 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ) : null}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Saindo..." : "Sair"}
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                onClick={() => setIsMenuOpen(false)}
                className="hidden text-sm font-bold text-brand-700 transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 md:inline"
              >
                Criar conta
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setIsAccountMenuOpen(false);
              setIsMenuOpen((open) => !open);
            }}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 md:hidden"
          >
            {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Navegação principal (mobile)"
          className="border-t border-slate-100 bg-white px-4 pb-5 pt-2 md:hidden"
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
            {!isAuthenticated && !isLoading ? (
              <li>
                <Link
                  href="/cadastro"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
                >
                  Criar conta
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>
      )}

      {logoutError ? (
        <p
          role="alert"
          className="fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-red-700 shadow-lg ring-1 ring-red-100"
        >
          {logoutError}
        </p>
      ) : null}
    </header>
  );
}
