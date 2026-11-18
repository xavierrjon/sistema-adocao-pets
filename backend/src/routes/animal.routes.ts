import { Router } from "express";
import * as animalController from "../controllers/animal.controller";
import { asyncHandler } from "../lib/async-handler";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadAnimalImage } from "../middlewares/image-upload.middleware";
import { createAnimalRateLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

router.get("/", asyncHandler(animalController.listAnimals));
router.get("/me", authMiddleware, asyncHandler(animalController.listMyAnimals));
router.get("/:id/contact", authMiddleware, asyncHandler(animalController.getContact));
router.get("/:id", asyncHandler(animalController.getAnimal));
// Multipart/form-data: campos do anúncio + arquivo opcional em "image".
router.post(
  "/",
  authMiddleware,
  createAnimalRateLimiter,
  uploadAnimalImage,
  asyncHandler(animalController.createAnimal),
);
router.put(
  "/:id",
  authMiddleware,
  uploadAnimalImage,
  asyncHandler(animalController.updateAnimal),
);
router.delete("/:id", authMiddleware, asyncHandler(animalController.deleteAnimal));

export default router;
