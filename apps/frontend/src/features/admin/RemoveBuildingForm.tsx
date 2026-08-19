import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@badger-board/components/ui/form";
import { Button } from "@badger-board/components/ui/button";
import { Input } from "@badger-board/components/ui/input";
import type { useAdminBoards } from "./useAdminBoards";

type RemoveBuildingFormProps = ReturnType<typeof useAdminBoards>;

export function RemoveBuildingForm({
  removeForm,
  handleRemove,
  isSubmitting,
}: RemoveBuildingFormProps) {
  return (
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
        <Button type="submit" size="lg" variant="destructive" disabled={isSubmitting}>
          {isSubmitting ? "Removing Building..." : "Remove Building"}
        </Button>
      </form>
    </Form>
  );
}
