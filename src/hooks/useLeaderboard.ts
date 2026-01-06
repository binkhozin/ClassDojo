import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import { useEffect } from "react";
import { formatLeaderboardData, calculateRankChanges } from "../lib/gamificationUtils";
import type { LeaderboardEntry, StudentWithPoints, BehaviorWithDetails } from "../types";

export function useLeaderboard(
  classId?: string,
  timePeriod: "today" | "week" | "month" | "all" = "all"
) {
  const query = useQuery({
    queryKey: ["leaderboard", classId, timePeriod],
    queryFn: async () => {
      if (!classId) return [];

      // Get students in the class
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("class_id", classId);

      if (studentsError) throw studentsError;

      // Get behaviors based on time period
      let query = supabase
        .from("behaviors")
        .select("*")
        .eq("class_id", classId);

      const now = new Date();

      switch (timePeriod) {
        case "today":
          const todayStart = new Date(now.setHours(0, 0, 0, 0));
          query = query.gte("created_at", todayStart.toISOString());
          break;
        case "week":
          const weekStart = new Date(now.setDate(now.getDate() - 7));
          query = query.gte("created_at", weekStart.toISOString());
          break;
        case "month":
          const monthStart = new Date(now.setDate(now.getDate() - 30));
          query = query.gte("created_at", monthStart.toISOString());
          break;
        case "all":
        default:
          // No time filter
          break;
      }

      const { data: behaviors, error: behaviorsError } = await query
        .order("created_at", { ascending: false });

      if (behaviorsError) throw behaviorsError;

      // Format leaderboard data
      const leaderboard = formatLeaderboardData(students as StudentWithPoints[], behaviors as BehaviorWithDetails[]);

      return leaderboard;
    },
    enabled: !!classId,
  });

  // Real-time subscription for leaderboard updates
  useEffect(() => {
    if (!classId) return;

    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "behaviors",
          filter: `class_id=eq.${classId}`,
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
          table: "students",
          filter: `class_id=eq.${classId}`,
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, query, timePeriod]);

  return query;
}