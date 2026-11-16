import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

// Os componentes usam hooks de navegação do App Router, que exigem o provider
// do Next.js. Nos testes de componente, mockamos o módulo.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
