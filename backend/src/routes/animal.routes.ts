import { Router } from "express";
import * as animalController from "../controllers/animal.controller";
import { asyncHandler } from "../lib/async-handler";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", asyncHandler(animalController.listAnimals));
router.get("/:id", asyncHandler(animalController.getAnimal));
router.post("/", authMiddleware, asyncHandler(animalController.createAnimal));
router.put("/:id", authMiddleware, asyncHandler(animalController.updateAnimal));
router.delete("/:id", authMiddleware, asyncHandler(animalController.deleteAnimal));

export default router;
