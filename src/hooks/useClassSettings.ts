import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import type { Database } from "../types";

type ClassSettings = Database["public"]["Tables"]["class_settings"]["Row"];
type ClassSettingsUpdate = Database["public"]["Tables"]["class_settings"]["Update"];

export function useClassSettings(classId?: string) {
  return useQuery({
    queryKey: ["class-settings", classId],
    queryFn: async () => {
      if (!classId) return null;
      
      const { data, error } = await supabase
        .from("class_settings")
        .select("*")
        .eq("class_id", classId)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") {
          // No settings found, return default
          return null;
        }
        throw error;
      }
      return data as ClassSettings;
    },
    enabled: !!classId,
  });
}

export function useUpdateClassSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ classId, updates }: { classId: string; updates: ClassSettingsUpdate }) => {
      const { data, error } = await supabase
        .from("class_settings")
        // @ts-expect-error - Supabase type inference issue
        .update(updates)
        .eq("class_id", classId)
        .select()
        .single();
      
      if (error) throw error;
      return data as ClassSettings;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["class-settings", data.class_id] });
    },
  });
}
