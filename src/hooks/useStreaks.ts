import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import { calculateStreaks } from "../lib/gamificationUtils";
import { useEffect } from "react";

export function useStreaks(studentId?: string, classId?: string) {
  const query = useQuery({
    queryKey: ["student-streaks", studentId, classId],
    queryFn: async () => {
      if (!studentId || !classId) return null;

      // Get student's behaviors
      const { data: behaviors, error: behaviorsError } = await supabase
        .from("behaviors")
        .select("*")
        .eq("student_id", studentId)
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

      if (behaviorsError) throw behaviorsError;

      // Calculate streaks
      const streaks = calculateStreaks(behaviors);

      return streaks;
    },
    enabled: !!studentId && !!classId,
  });

  // Real-time subscription for streak updates
  useEffect(() => {
    if (!studentId || !classId) return;

    const channel = supabase
      .channel("streak-changes")
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, classId, query]);

  return query;
}