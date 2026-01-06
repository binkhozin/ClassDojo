import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import type { Student, StudentInsert, StudentUpdate } from "../types";

export function useStudents(classId?: string) {
  return useQuery({
    queryKey: ["students", classId],
    queryFn: async () => {
      let query = supabase.from("students").select("*");
      
      if (classId) {
        query = query.eq("class_id", classId);
      }
      
      const { data, error } = await query.order("last_name", { ascending: true });
      
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!classId,
  });
}

export function useStudent(studentId?: string) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();
      
      if (error) throw error;
      return data as Student;
    },
    enabled: !!studentId,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentData: StudentInsert) => {
      const { data, error } = await supabase
        .from("students")
        .insert(studentData as any)
        .select()
        .single();
      
      if (error) throw error;
      return data as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: StudentUpdate }) => {
      const { data, error } = await supabase
        .from("students")
        // @ts-expect-error - Supabase type inference issue with generic Database type
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Student;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", data.id] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
