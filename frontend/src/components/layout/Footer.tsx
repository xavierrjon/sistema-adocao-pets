export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <p className="mx-auto w-full max-w-6xl px-4 py-3 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} — Sistema AdoteJá. Todos os direitos reservados.
      </p>
    </footer>
  );
}
