import type { Request, Response } from "express";
import * as userService from "../services/user.service";
import { userParamsSchema } from "../schemas/user.schema";

export async function getUser(request: Request, response: Response) {
  const { id } = userParamsSchema.parse(request.params);
  const user = await userService.getUserById(id);
  response.status(200).json(user);
}
