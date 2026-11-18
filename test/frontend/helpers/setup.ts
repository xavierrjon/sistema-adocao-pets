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
  useParams: () => ({ id: "5f1c2e78-9b0a-4c31-8a1f-2d6e7b8c9a01" }),
}));
