import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import type { BehaviorCategory, Database } from "../types";

type BehaviorCategoryInsert = Database["public"]["Tables"]["behavior_categories"]["Insert"];
type BehaviorCategoryUpdate = Database["public"]["Tables"]["behavior_categories"]["Update"];

export function useBehaviorCategories(classId?: string) {
  return useQuery({
    queryKey: ["behavior-categories", classId],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from("behavior_categories")
        .select("*")
        .eq("class_id", classId)
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as BehaviorCategory[];
    },
    enabled: !!classId,
  });
}

export function useCreateBehaviorCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData: BehaviorCategoryInsert) => {
      const { data, error } = await supabase
        .from("behavior_categories")
        .insert(categoryData)
        .select()
        .single();
      
      if (error) throw error;
      return data as BehaviorCategory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["behavior-categories", data.class_id] });
    },
  });
}

export function useUpdateBehaviorCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BehaviorCategoryUpdate }) => {
      const { data, error } = await supabase
        .from("behavior_categories")
        // @ts-expect-error - Supabase type inference issue
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BehaviorCategory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["behavior-categories", data.class_id] });
    },
  });
}

export function useDeleteBehaviorCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, classId }: { id: string; classId: string }) => {
      const { error } = await supabase
        .from("behavior_categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["behavior-categories", variables.classId] });
    },
  });
}
