import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import type { Behavior, BehaviorInsert, BehaviorWithDetails } from "../types";

export function useClassBehaviors(classId?: string, limit = 50) {
  return useQuery({
    queryKey: ["class-behaviors", classId, limit],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from("behaviors")
        .select(`
          *,
          category:behavior_categories(*),
          student:students(*),
          teacher:users(*)
        `)
        .eq("class_id", classId)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as BehaviorWithDetails[];
    },
    enabled: !!classId,
  });
}

export function useStudentBehaviors(studentId?: string) {
  return useQuery({
    queryKey: ["student-behaviors", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from("behaviors")
        .select(`
          *,
          category:behavior_categories(*),
          teacher:users(*)
        `)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as BehaviorWithDetails[];
    },
    enabled: !!studentId,
  });
}

export function useLogBehavior() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (behaviorData: BehaviorInsert) => {
      const { data, error } = await supabase
        .from("behaviors")
        .insert(behaviorData as any)
        .select()
        .single();
      
      if (error) throw error;
      return data as Behavior;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["class-behaviors", data.class_id] });
      queryClient.invalidateQueries({ queryKey: ["student-behaviors", data.student_id] });
      queryClient.invalidateQueries({ queryKey: ["students", data.class_id] });
      queryClient.invalidateQueries({ queryKey: ["student", data.student_id] });
    },
  });
}

export function useDeleteBehavior() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (behaviorId: string) => {
      const { data, error } = await supabase
        .from("behaviors")
        .delete()
        .eq("id", behaviorId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Behavior;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["class-behaviors", data.class_id] });
      queryClient.invalidateQueries({ queryKey: ["student-behaviors", data.student_id] });
      queryClient.invalidateQueries({ queryKey: ["students", data.class_id] });
      queryClient.invalidateQueries({ queryKey: ["student", data.student_id] });
    },
  });
}
