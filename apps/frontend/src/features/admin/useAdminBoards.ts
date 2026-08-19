import { useState } from "react";
import { useForm } from "react-hook-form";
import { createBoard, deleteBoard } from "@badger-board/lib/api";
import { isApiError } from "@badger-board/lib/apiClient";
import {
  type AddFormValues,
  type RemoveFormValues,
  addFormDefaults,
  createBoardSchema,
  removeBoardSchema,
  removeFormDefaults,
} from "./schemas";

export type Status = { type: "success" | "danger"; message: string } | null;

function messageOf(error: unknown): string {
  if (isApiError(error)) return error.message;
  return error instanceof Error ? error.message : "Request failed";
}

export function useAdminBoards() {
  const [status, setStatus] = useState<Status>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addForm = useForm<AddFormValues>({
    defaultValues: addFormDefaults,
  });

  const removeForm = useForm<RemoveFormValues>({
    defaultValues: removeFormDefaults,
  });

  const handleAdd = addForm.handleSubmit(async (values) => {
    const parsed = createBoardSchema.safeParse(values);
    if (!parsed.success) {
      setStatus({ type: "danger", message: parsed.error.issues[0]?.message ?? "Invalid form" });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    try {
      await createBoard(
        {
          name: parsed.data.name,
          coords: parsed.data.vertices,
          size: { width: parsed.data.width, height: parsed.data.height },
        },
        parsed.data.adminKey,
      );
      setStatus({ type: "success", message: "Building added successfully!" });
      addForm.reset();
    } catch (error) {
      setStatus({ type: "danger", message: messageOf(error) });
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleRemove = removeForm.handleSubmit(async (values) => {
    const parsed = removeBoardSchema.safeParse(values);
    if (!parsed.success) {
      setStatus({ type: "danger", message: parsed.error.issues[0]?.message ?? "Invalid form" });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    try {
      await deleteBoard(parsed.data.name, parsed.data.adminKey);
      setStatus({ type: "success", message: "Building removed successfully!" });
      removeForm.reset();
    } catch (error) {
      setStatus({ type: "danger", message: messageOf(error) });
    } finally {
      setIsSubmitting(false);
    }
  });

  return { status, setStatus, isSubmitting, addForm, removeForm, handleAdd, handleRemove };
}
