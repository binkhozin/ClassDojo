import * as z from "zod";

export const behaviorCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  point_value: z.coerce.number().int(),
  type: z.enum(["positive", "negative"]),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const behaviorLogSchema = z.object({
  student_id: z.string().uuid(),
  class_id: z.string().uuid(),
  category_id: z.string().uuid(),
  points: z.coerce.number().int(),
  note: z.string().optional(),
});

export type BehaviorCategoryValues = z.infer<typeof behaviorCategorySchema>;
export type BehaviorLogValues = z.infer<typeof behaviorLogSchema>;
