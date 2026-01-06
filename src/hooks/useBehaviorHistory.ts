import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase";
import type { BehaviorWithDetails } from "../types";
import { useEffect, useState } from "react";

export function useBehaviorHistory(
  classId?: string,
  filters: {
    studentId?: string;
    categoryId?: string;
    behaviorType?: 'positive' | 'negative';
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
  } = {},
  page: number = 1,
  pageSize: number = 20
) {
  const [realTimeData, setRealTimeData] = useState<BehaviorWithDetails[]>([]);

  const query = useQuery({
    queryKey: [
      "behavior-history",
      classId,
      filters.studentId,
      filters.categoryId,
      filters.behaviorType,
      filters.startDate,
      filters.endDate,
      filters.searchTerm,
      page,
      pageSize
    ],
    queryFn: async () => {
      if (!classId) return { data: [], count: 0 };

      let query = supabase
        .from("behaviors")
        .select(
          `
          *,
          category:behavior_categories(*),
          student:students(*),
          teacher:users(*)
        `,
          { count: "exact" }
        )
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.studentId) {
        query = query.eq("student_id", filters.studentId);
      }

      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters.behaviorType) {
        const isPositive = filters.behaviorType === "positive";
        query = query[isPositive ? "gt" : "lt"]("points", 0);
      }

      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      if (filters.searchTerm) {
        query = query.ilike("student:students(first_name)", `%${filters.searchTerm}%`)
          .or(`student:students(last_name).ilike.%${filters.searchTerm}%`);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data as BehaviorWithDetails[], count: count || 0 };
    },
    enabled: !!classId,
  });

  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    if (!classId) return;

    const channel = supabase
      .channel("behavior-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "behaviors",
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["behavior-history", classId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, queryClient]);

  return {
    ...query,
    data: query.data?.data || [],
    count: query.data?.count || 0,
    totalPages: query.data ? Math.ceil(query.data.count / pageSize) : 0,
  };
}