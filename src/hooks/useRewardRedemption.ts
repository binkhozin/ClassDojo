import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import { toast } from "sonner";
import { useStudentPoints } from "./useStudentPoints";

export function useRewardRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, rewardId }: { studentId: string; rewardId: string }) => {
      // Get reward details
      const { data: reward, error: rewardError } = await supabase
        .from("rewards")
        .select("*")
        .eq("id", rewardId)
        .single();

      if (rewardError) throw rewardError;

      // Get student's current points
      const { data: studentPoints, error: pointsError } = await supabase
        .from("behavior_snapshots")
        .select("*")
        .eq("student_id", studentId)
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .single();

      if (pointsError) throw pointsError;

      // Check if student has enough points
      if ((studentPoints?.total_points || 0) < reward.point_cost) {
        throw new Error(`Student needs ${reward.point_cost - (studentPoints?.total_points || 0)} more points`);
      }

      // Create redemption record
      const { data: redemption, error: redemptionError } = await supabase
        .from("student_rewards")
        .insert({
          student_id: studentId,
          reward_id: rewardId,
          earned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (redemptionError) throw redemptionError;

      // Deduct points from student
      const newPoints = (studentPoints?.total_points || 0) - reward.point_cost;

      const { error: updateError } = await supabase
        .from("behavior_snapshots")
        .update({
          total_points: newPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("id", studentPoints.id);

      if (updateError) throw updateError;

      // Create redemption record with points deducted
      return {
        ...redemption,
        pointsDeducted: reward.point_cost,
        newPoints,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["student-points", data.student_id] });
      queryClient.invalidateQueries({ queryKey: ["student-rewards", data.student_id] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });

      toast.success("Reward redeemed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to redeem reward");
      console.error("Error redeeming reward:", error);
    }
  });
}