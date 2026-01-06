import * as z from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  grade: z.string().optional(),
  description: z.string().optional(),
  school_name: z.string().optional(),
  academic_year: z.string().min(1, "Academic year is required"),
  color: z.string().optional(),
  max_points: z.coerce.number().int().min(1).optional().default(100),
});

export const updateClassSchema = createClassSchema.partial();

export const classSettingsSchema = z.object({
  points_per_good_behavior: z.coerce.number().int().min(1).default(1),
  points_per_bad_behavior: z.coerce.number().int().max(-1).default(-1),
  reset_frequency: z.enum(["daily", "weekly", "monthly", "never"]).default("never"),
  reset_day: z.coerce.number().int().min(1).max(31).optional(),
  notifications_enabled: z.boolean().default(true),
  parent_access: z.enum(["view_only", "full_access"]).default("view_only"),
});

export type CreateClassValues = z.infer<typeof createClassSchema>;
export type UpdateClassValues = z.infer<typeof updateClassSchema>;
export type ClassSettingsValues = z.infer<typeof classSettingsSchema>;
