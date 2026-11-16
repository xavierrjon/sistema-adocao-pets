import { Router } from "express";
import { asyncHandler } from "../lib/async-handler";
import * as animalController from "../controllers/animal.controller";

const router = Router();

router.get("/", asyncHandler(animalController.listAnimals));
router.get("/:id", asyncHandler(animalController.getAnimal));
router.post("/", asyncHandler(animalController.createAnimal));
router.put("/:id", asyncHandler(animalController.updateAnimal));
router.delete("/:id", asyncHandler(animalController.deleteAnimal));

export default router;
