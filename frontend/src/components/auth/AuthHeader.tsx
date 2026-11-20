import { BrandLogo } from "@/components/ui/BrandLogo";

export function AuthHeader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <BrandLogo className="h-24 sm:h-32 lg:h-36" />
    </div>
  );
}
