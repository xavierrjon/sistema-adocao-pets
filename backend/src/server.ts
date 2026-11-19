import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { swaggerSpec } from "./config/swagger";
import { isAllowedOrigin } from "./lib/auth";
import { HttpError } from "./lib/http-error";
import { csrfProtection } from "./middlewares/csrf.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";

const app = express();

const CORS_METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

const CORS_ALLOWED_HEADERS = [
  "Accept",
  "Authorization",
  "Content-Type",
  "Origin",
  "X-Requested-With",
];

// Aplicação servida atrás de proxy na maioria dos ambientes de produção.
app.set("trust proxy", 1);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Requisições sem Origin (curl, testes, server-to-server) são permitidas.
      if (!origin) return callback(null, true);

      if (isAllowedOrigin(origin)) return callback(null, true);

      return callback(new HttpError(403, "Origem não autorizada por CORS."));
    },
    methods: CORS_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
    // Preflight respondido pelo próprio middleware (204) antes de chegar às rotas.
    optionsSuccessStatus: 204,
    // Cache do preflight no navegador/CDN da Vercel por 24h.
    maxAge: 86400,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);

app.get("/api/docs/openapi.json", (_request, response) => {
  response.status(200).json(swaggerSpec);
});
// Alias mantido por compatibilidade com a URL histórica do documento OpenAPI.
app.get("/api/openapi.json", (_request, response) => {
  response.status(200).json(swaggerSpec);
});
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "AdoteJá API — Documentação",
    swaggerOptions: { persistAuthorization: true },
  }),
);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3001);

if (process.env.NODE_ENV !== "test" && process.env.VITEST !== "true") {
  app.listen(port, () => {
    console.log(`Servidor da API iniciado em http://localhost:${port}`);
  });
}

export default app;
