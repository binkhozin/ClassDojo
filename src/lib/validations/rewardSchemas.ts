import * as z from "zod";

export const rewardSchema = z.object({
  name: z.string().min(1, "Reward name is required"),
  description: z.string().optional(),
  pointCost: z.coerce.number().int().positive("Point cost must be positive"),
  icon: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const redeemRewardSchema = z.object({
  studentId: z.string().uuid("Student ID is required"),
  rewardId: z.string().uuid("Reward ID is required"),
});

export type RewardValues = z.infer<typeof rewardSchema>;
export type RedeemRewardValues = z.infer<typeof redeemRewardSchema>;