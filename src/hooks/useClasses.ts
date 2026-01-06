import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import type { Class, ClassInsert, ClassUpdate } from "../types";

export function useClasses(teacherId?: string) {
  return useQuery({
    queryKey: ["classes", teacherId],
    queryFn: async () => {
      let query = supabase.from("classes").select("*");
      
      if (teacherId) {
        query = query.eq("teacher_id", teacherId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Class[];
    },
    enabled: !!teacherId,
  });
}

export function useTeacherSummary(teacherId?: string) {
  return useQuery({
    queryKey: ["teacher-summary", teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase
        .from("teacher_class_summary")
        .select("*")
        .eq("teacher_id", teacherId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });
}

export function useClass(classId?: string) {
  return useQuery({
    queryKey: ["class", classId],
    queryFn: async () => {
      if (!classId) return null;
      
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();
      
      if (error) throw error;
      return data as Class;
    },
    enabled: !!classId,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classData: ClassInsert) => {
      const { data, error } = await supabase
        .from("classes")
        .insert(classData as any)
        .select()
        .single();
      
      if (error) throw error;
      return data as Class;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ClassUpdate }) => {
      const { data, error } = await supabase
        .from("classes")
        // @ts-expect-error - Supabase type inference issue with generic Database type
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Class;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", data.id] });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", classId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}
