import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@badger-board/components/ui/form";
import { Button } from "@badger-board/components/ui/button";
import { Input } from "@badger-board/components/ui/input";
import { VertexInputs } from "./VertexInputs";
import type { useAdminBoards } from "./useAdminBoards";

type AddBuildingFormProps = ReturnType<typeof useAdminBoards>;

export function AddBuildingForm({ addForm, handleAdd, isSubmitting }: AddBuildingFormProps) {
  return (
    <Form {...addForm}>
      <form onSubmit={handleAdd} className="grid gap-6">
        <FormField
          control={addForm.control}
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

        <div>
          <h5 className="mb-3" style={{ color: "#c5050c" }}>
            Building Corners
          </h5>
          <VertexInputs control={addForm.control} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={addForm.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width (pixels)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={addForm.control}
          name="adminPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Key</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Admin password for board management"
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
          className="bg-[linear-gradient(135deg,#c5050c_0%,#ff0000_100%)] font-bold"
        >
          {isSubmitting ? "Adding Building..." : "Add Building"}
        </Button>
      </form>
    </Form>
  );
}
