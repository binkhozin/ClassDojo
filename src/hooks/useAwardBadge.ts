import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import { toast } from "sonner";

export function useAwardBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, badgeId }: { studentId: string; badgeId: string }) => {
      // Check if student already has this badge
      const { data: existingBadge, error: existingError } = await supabase
        .from("student_badges")
        .select("*")
        .eq("student_id", studentId)
        .eq("badge_id", badgeId)
        .single();

      if (existingError && existingError.code !== "PGRST116") {
        throw existingError;
      }

      if (existingBadge) {
        throw new Error("Student already has this badge");
      }

      // Award the badge
      const { data, error } = await supabase
        .from("student_badges")
        .insert({
          student_id: studentId,
          badge_id: badgeId,
          earned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification
      const { data: badge, error: badgeError } = await supabase
        .from("badges")
        .select("*")
        .eq("id", badgeId)
        .single();

      if (!badgeError) {
        await supabase
          .from("notifications")
          .insert({
            user_id: studentId,
            type: "badge_earned",
            title: "New Badge Earned!",
            content: `You earned the "${badge.name}" badge!`,
            related_data: { badge_id: badgeId },
            is_read: false,
            created_at: new Date().toISOString(),
          });
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["student-badges", data.student_id] });
      queryClient.invalidateQueries({ queryKey: ["notifications", data.student_id] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });

      toast.success("Badge awarded successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to award badge");
      console.error("Error awarding badge:", error);
    }
  });
}