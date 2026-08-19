import { CreateSessionRequestSchema, CreateSessionResponseSchema } from "../schemas";
import { catchAsync } from "../middleware/catchAsync";
import { createSession as createSessionForCoords } from "../services/sessionService";

export const createSession = catchAsync(async (req, res) => {
  const { coords } = CreateSessionRequestSchema.parse(req.body);
  const session = await createSessionForCoords(coords);
  res.status(201).json(CreateSessionResponseSchema.parse(session));
});
