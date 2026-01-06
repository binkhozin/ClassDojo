import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  behaviorCategorySchema, 
  BehaviorCategoryValues 
} from "../../lib/validations/behaviorSchemas";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { BehaviorCategory } from "../../types";

interface BehaviorCategoryFormProps {
  initialData?: BehaviorCategory;
  onSubmit: (data: BehaviorCategoryValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BehaviorCategoryForm: React.FC<BehaviorCategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BehaviorCategoryValues>({
    resolver: zodResolver(behaviorCategorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      point_value: initialData?.point_value || 1,
      type: (initialData?.type as "positive" | "negative") || "positive",
      icon: initialData?.icon || "⭐",
      color: initialData?.color || "#3b82f6",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Helping Others" />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <Select id="type" {...register("type")}>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="point_value">Point Value</Label>
          <Input 
            id="point_value" 
            type="number" 
            {...register("point_value")} 
          />
          {errors.point_value && (
            <p className="text-sm text-destructive">{errors.point_value.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="icon">Icon (Emoji)</Label>
          <Input id="icon" {...register("icon")} placeholder="⭐" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="color">Color</Label>
          <Input id="color" type="color" {...register("color")} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Category" : "Add Category"}
        </Button>
      </div>
    </form>
  );
};
