import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { swaggerSpec } from "./config/swagger";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      if (isProduction) {
        return callback(new Error("Origem não autorizada por CORS."));
      }

      return callback(null, true);
    },
  }),
);

app.use(express.json());

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

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Servidor da API iniciado em http://localhost:${port}`);
  });
}

export default app;
