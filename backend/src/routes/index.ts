import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import openapiDocument from "../docs/openapi";
import authRoutes from "./auth.routes";
import animalRoutes from "./animal.routes";
import healthRoute from "./health";
import userRoutes from "./user.routes";

const router = Router();

router.get("/openapi.json", (_request, response) => {
  response.status(200).json(openapiDocument);
});
router.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument, { customSiteTitle: "AdoteJá API" }));

router.use(healthRoute);
router.use("/auth", authRoutes);
router.use("/animals", animalRoutes);
router.use("/users", userRoutes);

export default router;
