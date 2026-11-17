export function AuthLoading({ label = "Verificando sua sessão..." }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-64 flex-col items-center justify-center gap-4 py-10 text-center"
    >
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      <span className="text-sm font-semibold text-slate-600">{label}</span>
    </div>
  );
}
