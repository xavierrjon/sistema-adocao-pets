import multer from "multer";
import { MAX_IMAGE_SIZE_BYTES } from "../services/storage.service";

/**
 * Recebe a imagem em memória (nenhum arquivo toca o disco do servidor).
 * A validação real do conteúdo (magic bytes) é feita no serviço de
 * armazenamento; aqui limitamos apenas tamanho e quantidade.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1,
    fields: 20,
  },
});

export const uploadAnimalImage = upload.single("image");
