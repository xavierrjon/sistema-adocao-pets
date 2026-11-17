import type { ReactNode } from "react";
import { AuthHeader } from "./AuthHeader";
import { AuthIllustration } from "./AuthIllustration";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="bg-gradient-to-b from-brand-50 via-background to-background py-10 sm:py-14">
      <div className="mx-auto flex w-full max-w-6xl justify-center px-4 sm:px-6 lg:px-8">
        <section className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-30px_rgba(20,42,84,0.35)] ring-1 ring-slate-100">
          <div className="px-6 pb-8 pt-8 sm:px-9 sm:pt-10">
            <AuthHeader />

            <div className="mt-8 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-brand-950">{title}</h1>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                {subtitle}
              </p>
            </div>

            <div className="mt-8">{children}</div>
          </div>

          <AuthIllustration />
        </section>
      </div>
    </div>
  );
}
