import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { HeartIcon, PawIcon } from "@/components/ui/icons";

function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mx-auto mt-2 h-56 w-full max-w-md sm:h-72 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-full lg:w-[56%] lg:max-w-none"
    >
      {/* Formas orgânicas e brilho integrados ao fundo */}
      <div className="absolute -right-10 bottom-2 h-44 w-44 rounded-full bg-white/45 blur-2xl lg:right-8 lg:bottom-8 lg:h-64 lg:w-64" />
      <div className="absolute left-8 top-4 h-28 w-28 rounded-full bg-brand-200/35 blur-2xl lg:left-16 lg:top-12 lg:h-40 lg:w-40" />
      <svg
        className="absolute -right-4 bottom-0 h-full w-[115%] max-w-none text-white/35 lg:right-[-6%] lg:w-[110%]"
        viewBox="0 0 700 460"
        fill="none"
      >
        <path
          d="M105 355c0-78 57-148 136-170 55-16 89 6 132-10 61-23 129-20 180 34 46 48 58 118 31 177-29 63-94 99-163 103-91 6-172-4-230-62-33-33-86-42-86-72Z"
          fill="currentColor"
          opacity="0.55"
        />
        <circle cx="520" cy="120" r="58" fill="#ffffff" opacity="0.28" />
        <circle cx="170" cy="120" r="34" fill="#ffffff" opacity="0.22" />
      </svg>

      {/* Ilustração principal: cachorro e gato */}
      <svg
        viewBox="0 0 520 420"
        className="absolute bottom-[-2%] right-[-2%] h-[108%] w-auto max-w-none drop-shadow-sm lg:bottom-[-4%] lg:right-0 lg:h-[112%]"
        role="presentation"
      >
        <defs>
          <linearGradient id="hero-ground" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.65" />
            <stop offset="1" stopColor="#bcdfff" stopOpacity="0.28" />
          </linearGradient>
        </defs>

        <ellipse cx="290" cy="360" rx="190" ry="30" fill="#1d73ec" opacity="0.08" />
        <ellipse cx="292" cy="320" rx="175" ry="95" fill="url(#hero-ground)" opacity="0.7" />

        {/* Gato (atrás) */}
        <g transform="translate(286 96) scale(0.94)">
          <ellipse cx="136" cy="86" rx="36" ry="46" fill="#F2A65A" transform="rotate(-20 136 86)" />
          <ellipse cx="136" cy="86" rx="18" ry="28" fill="#F5A8A0" opacity="0.85" transform="rotate(-20 136 86)" />
          <ellipse cx="264" cy="86" rx="36" ry="46" fill="#F2A65A" transform="rotate(20 264 86)" />
          <ellipse cx="264" cy="86" rx="18" ry="28" fill="#F5A8A0" opacity="0.85" transform="rotate(20 264 86)" />
          <circle cx="200" cy="170" r="92" fill="#F2A65A" />
          <ellipse cx="166" cy="160" rx="12" ry="16" fill="#42342B" />
          <circle cx="170.5" cy="154" r="4" fill="#ffffff" opacity="0.95" />
          <ellipse cx="234" cy="160" rx="12" ry="16" fill="#42342B" />
          <circle cx="238.5" cy="154" r="4" fill="#ffffff" opacity="0.95" />
          <circle cx="138" cy="192" r="11" fill="#F5A8A0" opacity="0.35" />
          <circle cx="262" cy="192" r="11" fill="#F5A8A0" opacity="0.35" />
          <path d="M200 182 L190 194 Q200 203 210 194 Z" fill="#E3766B" />
          <path d="M200 203 Q191 213 181 207" stroke="#42342B" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M200 203 Q209 213 219 207" stroke="#42342B" strokeWidth="4" strokeLinecap="round" fill="none" />
          <g stroke="#42342B" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.28">
            <path d="M118 186 Q88 182 60 176" />
            <path d="M118 198 Q86 200 58 204" />
            <path d="M282 186 Q312 182 340 176" />
            <path d="M282 198 Q314 200 342 204" />
          </g>
          <path d="M136 240 Q200 296 264 240" stroke="#1D73EC" strokeWidth="16" strokeLinecap="round" fill="none" />
          <circle cx="200" cy="278" r="11" fill="#FFD166" stroke="#D9A930" strokeWidth="3" />
          <ellipse cx="120" cy="286" rx="34" ry="18" fill="#F2A65A" />
          <ellipse cx="280" cy="286" rx="34" ry="18" fill="#F2A65A" />
        </g>

        {/* Cachorro (frente) */}
        <g transform="translate(52 112)">
          <circle cx="200" cy="164" r="92" fill="#B07B4F" />
          <ellipse cx="108" cy="150" rx="35" ry="60" fill="#8E5E38" transform="rotate(12 108 150)" />
          <ellipse cx="292" cy="150" rx="35" ry="60" fill="#8E5E38" transform="rotate(-12 292 150)" />
          <ellipse cx="170" cy="148" rx="12" ry="15" fill="#42342B" />
          <circle cx="174" cy="143" r="4" fill="#ffffff" opacity="0.95" />
          <ellipse cx="230" cy="148" rx="12" ry="15" fill="#42342B" />
          <circle cx="234" cy="143" r="4" fill="#ffffff" opacity="0.95" />
          <ellipse cx="200" cy="198" rx="56" ry="42" fill="#D8B28C" />
          <ellipse cx="200" cy="222" rx="12" ry="10" fill="#F27D7D" />
          <ellipse cx="200" cy="180" rx="16" ry="11" fill="#42342B" />
          <ellipse cx="194" cy="176" rx="5" ry="3" fill="#ffffff" opacity="0.7" />
          <path d="M200 191 L200 202" stroke="#42342B" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M200 202 Q188 212 178 204" stroke="#42342B" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M200 202 Q212 212 222 204" stroke="#42342B" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M136 238 Q200 296 264 238" stroke="#EF6C4D" strokeWidth="16" strokeLinecap="round" fill="none" />
          <circle cx="200" cy="280" r="11" fill="#FFD166" stroke="#D9A930" strokeWidth="3" />
          <ellipse cx="132" cy="290" rx="35" ry="18" fill="#B07B4F" />
          <ellipse cx="268" cy="290" rx="35" ry="18" fill="#B07B4F" />
        </g>

        {/* Detalhes decorativos */}
        <path d="M410 90c-3.1-5.8-10.6-5.8-13 .4-2 4.8 3 9.8 9.3 14.9 6.3-5.1 11.3-10.1 9.3-14.9-2.4-6.2-9.9-6.2-13-.4z" fill="#F472B6" opacity="0.8" />
        <path d="M150 104c-2.3-4.3-7.8-4.3-9.6.3-1.5 3.5 2.2 7.3 6.9 11.1 4.7-3.8 8.4-7.6 6.9-11.1-1.8-4.6-7.3-4.6-9.6-.3z" fill="#F9A8D4" opacity="0.75" />
        <circle cx="118" cy="210" r="5" fill="#57b0fc" opacity="0.35" />
        <circle cx="456" cy="232" r="4" fill="#57b0fc" opacity="0.35" />
      </svg>

      {/* Pequenos elementos integrados */}
      <div className="absolute right-4 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-brand-600 shadow-sm ring-1 ring-white/70 backdrop-blur-sm lg:right-16 lg:top-16 lg:h-12 lg:w-12">
        <PawIcon className="h-5 w-5 lg:h-6 lg:w-6" />
      </div>
      <div className="absolute bottom-10 left-8 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/80 text-pink-500 shadow-sm ring-1 ring-white/70 backdrop-blur-sm lg:bottom-20 lg:left-24 lg:h-11 lg:w-11">
        <HeartIcon className="h-4 w-4 lg:h-5 lg:w-5" />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-brand-50/70 via-white to-background px-4 pt-6 pb-2 sm:px-6 lg:px-8 lg:pt-10">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-100 via-brand-50 to-white px-6 py-8 shadow-[0_24px_60px_-30px_rgba(20,42,84,0.35)] ring-1 ring-brand-100/80 sm:rounded-[2.5rem] sm:px-10 sm:py-12 lg:min-h-[29rem] lg:px-14 lg:py-14">
        {/* Camadas de fundo do banner */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/45 blur-3xl" />
          <div className="absolute right-[-8%] top-[-10%] h-72 w-72 rounded-full bg-brand-200/35 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[25%] h-72 w-72 rounded-full bg-brand-100/70 blur-3xl" />
          {/* Área mais limpa atrás do texto para legibilidade */}
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-brand-50/85 via-brand-50/55 to-transparent lg:w-[62%]" />
        </div>

        <HeroIllustration />

        <div className="relative z-10 flex max-w-xl flex-col items-start gap-5 lg:max-w-[52%] lg:pr-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-brand-700 shadow-sm ring-1 ring-brand-200/80 backdrop-blur-sm">
            <HeartIcon className="h-4 w-4 text-brand-600" />
            Adoção responsável
          </span>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-brand-950 sm:text-5xl lg:text-[3.35rem]">
            Encontre um novo{" "}
            <span className="text-brand-600">companheiro</span> que precisa de um lar
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-slate-700">
            Encontre animais para adoção perto de você e faça a diferença na vida de quem só quer amor.
          </p>

          <Link href="/animais" className={buttonClasses({ variant: "primary", size: "lg" })}>
            Encontrar animais 🐾
          </Link>
        </div>
      </div>
    </section>
  );
}
