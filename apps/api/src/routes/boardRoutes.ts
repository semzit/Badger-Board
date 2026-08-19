import { Router } from "express";
import {
  createBoard,
  deleteBoard,
  getBoard,
  getPixels,
  listBoards,
  updatePixels,
} from "../controllers/boardController";
import { adminAuth } from "../middleware/adminAuth";

export const boardRoutes = Router();

boardRoutes.get("/", listBoards);
boardRoutes.post("/", adminAuth, createBoard);
boardRoutes.get("/:name", getBoard);
boardRoutes.delete("/:name", adminAuth, deleteBoard);
boardRoutes.patch("/:name/pixels", updatePixels);
boardRoutes.get("/:name/pixels", getPixels);
