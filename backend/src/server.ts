import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { swaggerSpec } from "./config/swagger";
import { getAllowedOrigins } from "./lib/auth";
import { HttpError } from "./lib/http-error";
import { csrfProtection } from "./middlewares/csrf.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";

const app = express();

const allowedOrigins = getAllowedOrigins();

// Aplicação servida atrás de proxy na maioria dos ambientes de produção.
app.set("trust proxy", 1);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new HttpError(403, "Origem não autorizada por CORS."));
    },
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);

app.get("/api/docs/openapi.json", (_request, response) => {
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
