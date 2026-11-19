"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, buttonClasses } from "@/components/ui/Button";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { useAuth } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/animais", label: "Animais" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

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
      router.push("/");
    } catch {
      setLogoutError("Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  function renderAuthActions(mobile = false) {
    if (isLoading) {
      return <span aria-hidden="true" className="block h-9 w-24 animate-pulse rounded-full bg-slate-100" />;
    }

    if (isAuthenticated) {
      const firstName = user?.name.trim().split(" ")[0] ?? "Usuário";
      const accountLinks = [
        { href: "/meus-animais", label: "Meus animais" },
        { href: "/perfil", label: "Meu perfil" },
      ];

      return (
        <div className={mobile ? "flex flex-col gap-2" : "flex items-center gap-3"}>
          <span className="text-sm font-semibold text-brand-800">Olá, {firstName}</span>
          {accountLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className={
                mobile
                  ? "w-full text-left text-sm font-bold text-brand-700 hover:underline"
                  : "hidden text-sm font-bold text-brand-700 hover:underline lg:inline"
              }
            >
              {label}
            </Link>
          ))}
          <Button
            variant="outline"
            size="sm"
            className={mobile ? "w-full" : ""}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Saindo..." : "Sair"}
          </Button>
        </div>
      );
    }

    return (
      <div className={mobile ? "flex flex-col gap-3 pt-2" : "flex items-center gap-3"}>
        <Link
          href="/login"
          onClick={() => setIsMenuOpen(false)}
          className={buttonClasses({ variant: "outline", size: "sm", className: mobile ? "w-full" : "" })}
        >
          Entrar
        </Link>
        <Link
          href="/cadastro"
          onClick={() => setIsMenuOpen(false)}
          className={
            mobile
              ? "text-center text-sm font-bold text-brand-700 hover:underline"
              : "hidden text-sm font-bold text-brand-700 hover:underline lg:inline"
          }
        >
          Criar conta
        </Link>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          aria-label="AdoteJá — página inicial"
        >
          <img
            src="/images/logo-adoteja.svg"
            alt="AdoteJá"
            width={120}
            height={68}
            className="h-21 w-auto object-contain"
          />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClasses(href)} aria-current={isLinkActive(href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
          {renderAuthActions()}
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
            <li>{renderAuthActions(true)}</li>
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
