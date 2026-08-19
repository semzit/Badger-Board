import { Router } from "express";
import { CreateBoardRequestSchema, UpdatePixelsRequestSchema } from "../schemas";
import {
  createBoard,
  deleteBoard,
  getBoard,
  getPixels,
  listBoards,
  updatePixels,
} from "../controllers/boardController";
import { adminAuth } from "../middleware/adminAuth";
import { validate } from "../middleware/validate";

export const boardRoutes = Router();

boardRoutes.get("/", listBoards);
boardRoutes.post("/", adminAuth, validate(CreateBoardRequestSchema), createBoard);
boardRoutes.get("/:name", getBoard);
boardRoutes.delete("/:name", adminAuth, deleteBoard);
boardRoutes.patch("/:name/pixels", validate(UpdatePixelsRequestSchema), updatePixels);
boardRoutes.get("/:name/pixels", getPixels);
