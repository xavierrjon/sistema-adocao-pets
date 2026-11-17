import { PawIcon } from "@/components/ui/icons";

export function AuthHeader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm shadow-brand-600/25">
        <PawIcon className="h-7 w-7" />
      </span>
      <span className="text-2xl font-extrabold tracking-tight text-brand-950">
        Adote<span className="text-brand-600">Já</span>
      </span>
    </div>
  );
}
