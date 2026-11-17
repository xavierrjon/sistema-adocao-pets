import Image from "next/image";

export function AuthIllustration() {
  return (
    <div className="mt-2 bg-gradient-to-b from-brand-50 to-brand-100/70 px-6 pb-2 pt-4 sm:px-10">
      <Image
        src="/images/hero-pets.svg"
        alt="Ilustração de um cachorro e uma gata juntos, representando a adoção responsável"
        width={800}
        height={600}
        className="mx-auto h-auto w-full max-w-[19rem] select-none"
      />
    </div>
  );
}
