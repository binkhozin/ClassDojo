import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import { useEffect } from "react";

export function useStudentPoints(studentId?: string, classId?: string) {
  const query = useQuery({
    queryKey: ["student-points", studentId, classId],
    queryFn: async () => {
      if (!studentId || !classId) return { totalPoints: 0, history: [] };

      // Get current total points from snapshots
      const { data: snapshot, error: snapshotError } = await supabase
        .from("behavior_snapshots")
        .select("*")
        .eq("student_id", studentId)
        .eq("class_id", classId)
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .single();

      if (snapshotError && snapshotError.code !== "PGRST116") {
        throw snapshotError;
      }

      // Get behavior history for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: behaviors, error: behaviorsError } = await supabase
        .from("behaviors")
        .select("*")
        .eq("student_id", studentId)
        .eq("class_id", classId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (behaviorsError) throw behaviorsError;

      // Calculate weekly and monthly totals
      const weeklyTotal = behaviors
        .filter(b => {
          const behaviorDate = new Date(b.created_at!);
          const today = new Date();
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(today.getDate() - 7);
          return behaviorDate >= sevenDaysAgo;
        })
        .reduce((sum, b) => sum + b.points, 0);

      const monthlyTotal = behaviors.reduce((sum, b) => sum + b.points, 0);

      return {
        totalPoints: snapshot?.total_points || 0,
        weeklyTotal,
        monthlyTotal,
        history: behaviors,
      };
    },
    enabled: !!studentId && !!classId,
  });

  // Real-time subscription for point updates
  useEffect(() => {
    if (!studentId || !classId) return;

    const channel = supabase
      .channel("student-points-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "behaviors",
          filter: `student_id=eq.${studentId}.and(class_id=eq.${classId})`,
        },
        () => {
          query.refetch();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "behavior_snapshots",
          filter: `student_id=eq.${studentId}.and(class_id=eq.${classId})`,
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, classId, query]);

  return query;
}