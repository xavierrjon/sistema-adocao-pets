import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Início" },
  { href: "/animais", label: "Animais" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:px-6 md:flex-row md:justify-between lg:px-8">
        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
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
              className="h-9 w-auto object-contain"
            />
          </Link>
          <p className="text-sm text-slate-500">
            Conectando animais que precisam de um lar a famílias que precisam deles.
          </p>
        </div>

        <nav aria-label="Links do rodapé">
          <ul className="flex items-center gap-6">
            {FOOTER_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm font-bold text-slate-600 transition hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-slate-100">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} AdoteJá · Sistema de adoção responsável de pets.
        </p>
      </div>
    </footer>
  );
}
