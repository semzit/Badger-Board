import { z } from "zod";
import { emptyVertices } from "@badger-board/lib/board";

export const coordinateSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180).max(180, "Longitude must be between -180 and 180"),
});

export const createBoardSchema = z.object({
  name: z.string().min(1, "Building name is required"),
  adminKey: z.string().min(1, "Admin key is required"),
  width: z.coerce.number().int().positive().default(100),
  height: z.coerce.number().int().positive().default(100),
  vertices: z.array(coordinateSchema).length(4, "Provide exactly 4 building corners"),
});

export const removeBoardSchema = z.object({
  name: z.string().min(1, "Building name is required"),
  adminKey: z.string().min(1, "Admin key is required"),
});

export type AddFormValues = {
  name: string;
  adminKey: string;
  width: string;
  height: string;
  vertices: { latitude: string; longitude: string }[];
};

export type RemoveFormValues = {
  name: string;
  adminKey: string;
};

export const addFormDefaults: AddFormValues = {
  name: "",
  adminKey: "",
  width: "100",
  height: "100",
  vertices: emptyVertices(),
};

export const removeFormDefaults: RemoveFormValues = {
  name: "",
  adminKey: "",
};
