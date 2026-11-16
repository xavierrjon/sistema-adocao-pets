"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type ApiStatus = "verificando" | "online" | "offline";

export default function Home() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("verificando");

  useEffect(() => {
    api
      .getHealth()
      .then((data) => setApiStatus(data.status === "ok" ? "online" : "offline"))
      .catch(() => setApiStatus("offline"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">AdoteJá</h1>
      <p className="max-w-md text-base text-neutral-600 dark:text-neutral-300 sm:text-lg">
        Encontre um novo companheiro.
      </p>
      <button
        type="button"
        className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        Ver animais
      </button>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        API: {apiStatus === "verificando" ? "verificando…" : apiStatus === "online" ? "online" : "offline"}
      </p>
    </main>
  );
}