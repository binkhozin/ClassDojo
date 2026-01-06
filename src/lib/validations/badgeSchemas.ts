import * as z from "zod";

export const badgeSchema = z.object({
  name: z.string().min(1, "Badge name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  requirementType: z.enum(["points_threshold", "behavior_count", "achievement"]),
  requirementValue: z.coerce.number().int().positive("Requirement value must be positive"),
});

export const awardBadgeSchema = z.object({
  studentId: z.string().uuid("Student ID is required"),
  badgeId: z.string().uuid("Badge ID is required"),
});

export type BadgeValues = z.infer<typeof badgeSchema>;
export type AwardBadgeValues = z.infer<typeof awardBadgeSchema>;