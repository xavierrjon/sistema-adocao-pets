"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

const AUTH_PATHS = ["/login", "/cadastro"];

export function AppFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (AUTH_PATHS.includes(normalizedPath)) {
    return null;
  }

  return <>{children}</>;
}
