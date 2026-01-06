import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import type { Database, RelationshipType, User } from "../types";

type ParentStudentLink = Database["public"]["Tables"]["parent_student_link"]["Row"];

export function useStudentParents(studentId?: string) {
  return useQuery({
    queryKey: ["student-parents", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from("parent_student_link")
        .select(`
          *,
          parent:users(*)
        `)
        .eq("student_id", studentId);
      
      if (error) throw error;
      return data as (ParentStudentLink & { parent: User })[];
    },
    enabled: !!studentId,
  });
}

export function useAddParentToStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      studentId, 
      parentId, 
      relationship 
    }: { 
      studentId: string; 
      parentId: string; 
      relationship: RelationshipType 
    }) => {
      const { data, error } = await supabase
        .from("parent_student_link")
        .insert({
          student_id: studentId,
          parent_id: parentId,
          relationship
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["student-parents", variables.studentId] });
    },
  });
}

export function useRemoveParentFromStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ studentId, parentId }: { studentId: string; parentId: string }) => {
      const { error } = await supabase
        .from("parent_student_link")
        .delete()
        .eq("student_id", studentId)
        .eq("parent_id", parentId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["student-parents", variables.studentId] });
    },
  });
}
