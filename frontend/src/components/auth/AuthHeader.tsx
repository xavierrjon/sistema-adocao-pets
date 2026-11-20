export function AuthHeader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <img
        src="/images/logo-adoteja.svg"
        alt="AdoteJá"
        width={1920}
        height={1080}
        className="h-16 w-auto object-contain"
      />
    </div>
  );
}
