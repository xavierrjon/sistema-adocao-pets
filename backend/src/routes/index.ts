import { Router } from "express";
import healthRoute from "./health";
import animalRoutes from "./animal.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use(healthRoute);
router.use("/animals", animalRoutes);
router.use("/users", userRoutes);

export default router;
