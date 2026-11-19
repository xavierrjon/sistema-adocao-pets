import type { ReactNode } from "react";
import { AuthHeader } from "./AuthHeader";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-brand-50 via-background to-background">
      <div className="mx-auto flex w-full max-w-2xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <AuthHeader className="lg:items-start" />

        <div className="mt-8 text-center lg:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 lg:mx-0">
            {subtitle}
          </p>
        </div>

        <div className="mt-9 w-full">{children}</div>
      </div>
    </div>
  );
}
