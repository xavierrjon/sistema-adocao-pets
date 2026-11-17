-- Necessário para converter senhas legadas em hashes bcrypt sem descartar usuários existentes.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- A coluna antiga "password" passa a armazenar exclusivamente o hash da senha.
ALTER TABLE "users" RENAME COLUMN "password" TO "passwordHash";

-- Registros criados antes da autenticação tinham a senha em texto puro.
-- Valores que já parecem bcrypt são preservados.
UPDATE "users"
SET "passwordHash" = crypt("passwordHash", gen_salt('bf', 12))
WHERE "passwordHash" !~ '^\$2[aby]\$';

-- O cadastro via API não exige WhatsApp; o campo continua disponível para anúncios.
ALTER TABLE "users" ALTER COLUMN "whatsapp" DROP NOT NULL;

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
