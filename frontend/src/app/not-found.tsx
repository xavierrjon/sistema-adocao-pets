import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { PawIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <PawIcon className="h-10 w-10" />
      </span>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-950">Página não encontrada</h1>
        <p className="max-w-sm text-slate-600">
          Parece que esse amiguinho se escondeu. Que tal conhecer os que estão disponíveis?
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses({ variant: "outline" })}>
          Voltar ao início
        </Link>
        <Link href="/animais" className={buttonClasses({ variant: "primary" })}>
          Ver animais
        </Link>
      </div>
    </div>
  );
}
