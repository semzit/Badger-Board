import { type Control, useFieldArray } from "react-hook-form";
import { Card, CardContent } from "@badger-board/components/ui/card";
import { FormControl, FormItem, FormLabel } from "@badger-board/components/ui/form";
import { Input } from "@badger-board/components/ui/input";
import type { AddFormValues } from "./schemas";

type VertexInputsProps = {
  control: Control<AddFormValues>;
};

export function VertexInputs({ control }: VertexInputsProps) {
  const { fields, update } = useFieldArray({ control, name: "vertices" });

  return (
    <div className="grid gap-4">
      {fields.map((vertex, index) => (
        <Card key={vertex.id} style={{ border: "2px solid #f0f0f0" }}>
          <CardContent className="grid gap-4 pt-4">
            <h6 style={{ color: "#c5050c", marginBottom: "5px" }}>Vertex {index + 1}</h6>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormItem>
                <FormLabel className="small">Latitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="43.073051"
                    value={vertex.latitude}
                    onChange={(e) => update(index, { ...vertex, latitude: e.target.value })}
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="small">Longitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="-89.401230"
                    value={vertex.longitude}
                    onChange={(e) => update(index, { ...vertex, longitude: e.target.value })}
                  />
                </FormControl>
              </FormItem>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
