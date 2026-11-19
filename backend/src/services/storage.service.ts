import crypto from "node:crypto";
import { HttpError } from "../lib/http-error";

/**
 * Armazenamento de imagens dos anúncios.
 *
 * O upload é feito diretamente na API do Cloudinary com assinatura calculada
 * aqui no servidor (as credenciais nunca chegam ao frontend). Optamos por
 * chamar a API REST com o FormData nativo do Node 22 em vez de instalar o
 * SDK oficial, evitando uma dependência desnecessária.
 *
 * Arquivos não ficam no disco do servidor: a Vercel não persiste arquivos
 * locais, então o banco guarda apenas a referência (URL) da imagem.
 */

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Tipos de arquivo permitidos: apenas fotos reais, validadas por magic bytes. */
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type UploadedImage = {
  /** URL pública da imagem (usada pelo frontend). */
  url: string;
  /** Identificador no Cloudinary (usado para substituir/remover o arquivo). */
  publicId: string;
};

/**
 * Detecta o tipo real do arquivo pelo conteúdo (magic bytes), não pela
 * extensão nem pelo Content-Type informado pelo cliente.
 */
export function detectImageMimeType(buffer: Buffer): (typeof ALLOWED_IMAGE_MIME_TYPES)[number] | null {
  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return "image/png";
  }

  // WebP: "RIFF" + 4 bytes de tamanho + "WEBP"
  const isRiff = buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF";
  const isWebp = buffer.length >= 12 && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (isRiff && isWebp) {
    return "image/webp";
  }

  return null;
}

function readCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new HttpError(
      503,
      "Serviço de imagens não configurado. Informe as credenciais do Cloudinary no ambiente.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function isImageUploadConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

/** Assinatura SHA-1 exigida pela API de upload do Cloudinary. */
function signParams(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${sorted}${apiSecret}`).digest("hex");
}

/**
 * Envia a imagem para o Cloudinary.
 * Lança 400 quando o conteúdo não é uma imagem permitida e 502 quando o
 * serviço de armazenamento falha, para que o anúncio não fique inconsistente.
 */
export async function uploadAnimalImage(file: {
  buffer: Buffer;
  size: number;
}): Promise<UploadedImage> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new HttpError(413, "A imagem deve ter no máximo 5 MB.");
  }

  const mimeType = detectImageMimeType(file.buffer);

  if (!mimeType) {
    throw new HttpError(400, "Formato de imagem não suportado. Use JPEG, PNG ou WebP.");
  }

  const { cloudName, apiKey, apiSecret } = readCloudinaryConfig();

  // Nome não previsível: impossibilita descobrir URLs de outros anúncios.
  const publicId = `adoteja/animals/${crypto.randomUUID()}`;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signParams({ public_id: publicId, timestamp }, apiSecret);

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(file.buffer)], { type: mimeType }), "animal");
  form.append("public_id", publicId);
  form.append("timestamp", timestamp);
  form.append("api_key", apiKey);
  form.append("signature", signature);

  let response: Response;

  try {
    response = await fetch(`${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });
  } catch {
    throw new HttpError(502, "Não foi possível enviar a imagem ao serviço de armazenamento.");
  }

  if (!response.ok) {
    throw new HttpError(502, "Não foi possível salvar a imagem no serviço de armazenamento.");
  }

  const result = (await response.json().catch(() => null)) as {
    secure_url?: unknown;
    public_id?: unknown;
  } | null;

  if (typeof result?.secure_url !== "string" || typeof result?.public_id !== "string") {
    throw new HttpError(502, "Resposta inválida do serviço de armazenamento.");
  }

  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Remove a imagem do Cloudinary. Falhas são apenas registradas: a exclusão do
 * anúncio (ou a substituição da imagem) já foi concluída no banco e não deve
 * falhar por causa de um problema no armazenamento.
 */
export async function deleteAnimalImage(publicId: string): Promise<void> {
  if (!isImageUploadConfigured()) {
    return;
  }

  const { cloudName, apiKey, apiSecret } = readCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signParams({ public_id: publicId, timestamp }, apiSecret);

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("timestamp", timestamp);
  form.append("api_key", apiKey);
  form.append("signature", signature);

  try {
    await fetch(`${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/destroy`, {
      method: "POST",
      body: form,
    });
  } catch (error) {
    console.error("Falha ao remover imagem do armazenamento:", error);
  }
}
