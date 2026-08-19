import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { createBoard, deleteBoard } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const coordinateSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180).max(180, "Longitude must be between -180 and 180"),
});

const createBoardSchema = z.object({
  name: z.string().min(1, "Building name is required"),
  adminKey: z.string().min(1, "Admin key is required"),
  width: z.coerce.number().int().positive().default(100),
  height: z.coerce.number().int().positive().default(100),
  vertices: z.array(coordinateSchema).length(4, "Provide exactly 4 building corners"),
});

const removeBoardSchema = z.object({
  name: z.string().min(1, "Building name is required"),
  adminKey: z.string().min(1, "Admin key is required"),
});

type AddFormValues = {
  name: string;
  adminKey: string;
  width: string;
  height: string;
  vertices: { latitude: string; longitude: string }[];
};

type RemoveFormValues = {
  name: string;
  adminKey: string;
};

type Status = { type: "success" | "danger"; message: string } | null;

const emptyVertices = () => Array.from({ length: 4 }, () => ({ latitude: "", longitude: "" }));

function BuildingForm() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addForm = useForm<AddFormValues>({
    defaultValues: {
      name: "",
      adminKey: "",
      width: "100",
      height: "100",
      vertices: emptyVertices(),
    },
  });

  const { fields, update } = useFieldArray({
    control: addForm.control,
    name: "vertices",
  });

  const removeForm = useForm<RemoveFormValues>({
    defaultValues: { name: "", adminKey: "" },
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
      setStatus({
        type: "danger",
        message: error instanceof Error ? error.message : "Failed to add building",
      });
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
      setStatus({
        type: "danger",
        message: error instanceof Error ? error.message : "Failed to remove building",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#c5050c",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 2001,
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Home
        </Button>

        <Card
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h2 className="text-center mb-4" style={{ color: "#c5050c", fontWeight: "bold" }}>
            Add/Remove A New Building
          </h2>

          <p className="text-center text-muted mb-4">
            Building corners not needed for remove operation
          </p>

          {status && (
            <Alert variant={status.type === "danger" ? "destructive" : "default"} className="mb-4">
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          <Form {...addForm}>
            <form onSubmit={handleAdd} className="grid gap-6">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Morgridge Hall"
                        style={{
                          padding: "12px",
                          borderRadius: "10px",
                          border: "2px solid #dee2e6",
                        }}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div>
                <h5 className="mb-3" style={{ color: "#c5050c" }}>
                  Building Corners
                </h5>
                <div className="grid gap-4">
                  {fields.map((vertex, index) => (
                    <Card key={vertex.id} style={{ border: "2px solid #f0f0f0" }}>
                      <CardContent className="grid gap-4 pt-4">
                        <h6 style={{ color: "#c5050c", marginBottom: "5px" }}>
                          Vertex {index + 1}
                        </h6>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormItem>
                            <FormLabel className="small">Latitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.000001"
                                placeholder="43.073051"
                                value={vertex.latitude}
                                onChange={(e) =>
                                  update(index, { ...vertex, latitude: e.target.value })
                                }
                                style={{ borderRadius: "8px" }}
                              />
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormLabel className="small">Longitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.000001"
                                placeholder="-89.401230"
                                value={vertex.longitude}
                                onChange={(e) =>
                                  update(index, { ...vertex, longitude: e.target.value })
                                }
                                style={{ borderRadius: "8px" }}
                              />
                            </FormControl>
                          </FormItem>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={addForm.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width (pixels)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          style={{
                            padding: "12px",
                            borderRadius: "10px",
                            border: "2px solid #dee2e6",
                          }}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (pixels)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          style={{
                            padding: "12px",
                            borderRadius: "10px",
                            border: "2px solid #dee2e6",
                          }}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addForm.control}
                name="adminKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Admin key for board management"
                        style={{
                          padding: "12px",
                          borderRadius: "10px",
                          border: "2px solid #dee2e6",
                        }}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                style={{
                  background: "linear-gradient(135deg, #c5050c 0%, #ff0000 100%)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "15px",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: "#fff",
                }}
              >
                {isSubmitting ? "Adding Building..." : "Add Building"}
              </Button>
            </form>
          </Form>

          <Form {...removeForm}>
            <form onSubmit={handleRemove} className="grid gap-4 mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={removeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Morgridge Hall" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={removeForm.control}
                  name="adminKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Key</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Admin key" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                variant="destructive"
                disabled={isSubmitting}
                style={{
                  borderRadius: "12px",
                  padding: "15px",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                {isSubmitting ? "Removing Building..." : "Remove Building"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default BuildingForm;
