import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import { toast } from "sonner";
import type { BehaviorInsert, BehaviorWithDetails } from "../types";
import { checkBadgeEligibility } from "../lib/gamificationUtils";

export function useLogBehavior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (behaviorData: BehaviorInsert) => {
      const { data, error } = await supabase
        .from("behaviors")
        .insert(behaviorData as any)
        .select(
          `
          *,
          category:behavior_categories(*),
          student:students(*)
        `
        )
        .single();

      if (error) throw error;
      return data as BehaviorWithDetails;
    },
    onSuccess: async (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["class-behaviors", data.class_id] });
      queryClient.invalidateQueries({ queryKey: ["student-behaviors", data.student_id] });
      queryClient.invalidateQueries({ queryKey: ["students", data.class_id] });
      queryClient.invalidateQueries({ queryKey: ["student", data.student_id] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard", data.class_id] });
      queryClient.invalidateQueries({ queryKey: ["student-stats", data.student_id] });

      // Check for badge eligibility
      const studentId = data.student_id;
      const classId = data.class_id;
      
      // Fetch student's current points and behaviors
      const { data: studentBehaviors, error: behaviorsError } = await supabase
        .from("behaviors")
        .select("*")
        .eq("student_id", studentId);
      
      if (behaviorsError) {
        console.error("Error fetching student behaviors:", behaviorsError);
        return;
      }
      
      const goodBehaviors = studentBehaviors.filter(b => b.points > 0).length;
      const totalPoints = studentBehaviors.reduce((sum, b) => sum + b.points, 0);
      
      // Fetch available badges
      const { data: badges, error: badgesError } = await supabase
        .from("badges")
        .select("*")
        .eq("class_id", classId);
      
      if (badgesError) {
        console.error("Error fetching badges:", badgesError);
        return;
      }
      
      // Fetch student's earned badges
      const { data: studentBadges, error: studentBadgesError } = await supabase
        .from("student_badges")
        .select("*")
        .eq("student_id", studentId);
      
      if (studentBadgesError) {
        console.error("Error fetching student badges:", studentBadgesError);
        return;
      }
      
      // Check eligibility
      const eligibleBadges = checkBadgeEligibility(
        totalPoints,
        goodBehaviors,
        badges,
        studentBadges
      );
      
      // Award eligible badges
      if (eligibleBadges.length > 0) {
        for (const badgeId of eligibleBadges) {
          const { error: awardError } = await supabase
            .from("student_badges")
            .insert({
              student_id: studentId,
              badge_id: badgeId,
              earned_at: new Date().toISOString()
            });
          
          if (awardError) {
            console.error("Error awarding badge:", awardError);
          } else {
            // Create notification
            const badge = badges.find(b => b.id === badgeId);
            if (badge) {
              await supabase
                .from("notifications")
                .insert({
                  user_id: studentId,
                  type: "badge_earned",
                  title: "New Badge Earned!",
                  content: `You earned the "${badge.name}" badge!`,
                  related_data: { badge_id: badgeId },
                  is_read: false,
                  created_at: new Date().toISOString()
                });
            }
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ["student-badges", studentId] });
        queryClient.invalidateQueries({ queryKey: ["notifications", studentId] });
      }

      // Create behavior logged notification
      await supabase
        .from("notifications")
        .insert({
          user_id: data.teacher_id,
          type: "behavior_alert",
          title: "Behavior Logged",
          content: `You logged "${data.category?.name}" for ${data.student?.first_name} ${data.student?.last_name}`,
          related_data: { behavior_id: data.id },
          is_read: false,
          created_at: new Date().toISOString()
        });

      toast.success("Behavior logged successfully!");
    },
    onError: (error) => {
      toast.error("Failed to log behavior: " + error.message);
      console.error("Error logging behavior:", error);
    }
  });
}