type BrandLogoProps = {
  className?: string;
};

/** Logo oficial AdoteJá, reutilizada em todas as telas. */
export function BrandLogo({ className = "h-21" }: BrandLogoProps) {
  return (
    <img
      src="/images/logo-adoteja.svg"
      alt="AdoteJá"
      width={1920}
      height={1080}
      className={`w-auto object-contain ${className}`}
    />
  );
}
