import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Announcement, SearchFilters, PaginatedResponse } from "@/types";
import { toast } from "sonner";

export function useAnnouncements(options: {
  filters?: SearchFilters;
  page?: number;
  limit?: number;
} = {}) {
  const { user } = useAuth();
  const { filters = {}, page = 1, limit = 20 } = options;
  
  return useQuery({
    queryKey: ["announcements", user?.id, filters, page, limit],
    queryFn: async (): Promise<PaginatedResponse<Announcement>> => {
      if (!user?.id) throw new Error("User not authenticated");

      // First get the parent's linked children to filter announcements
      const { data: linkedChildren } = await supabase
        .from("parent_student_link")
        .select(`
          student:students (
            class_id
          )
        `)
        .eq("parent_id", user.id);

      const classIds = linkedChildren?.map(link => link.student.class_id).filter(Boolean) || [];

      if (classIds.length === 0) {
        return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
      }

      let query = supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey (*),
          class:classes!inner (*)
        `)
        .eq("message_type", "announcement")
        .in("class_id", classIds)
        .or(`sender_id.eq.${user.id},content.ilike.%${user.id}%`);

      // Apply filters
      if (filters.query) {
        query = query.or(`content.ilike.%${filters.query}%,subject.ilike.%${filters.query}%`);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      // Order by creation date
      query = query.order("created_at", { ascending: false });

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform to Announcement format
      const announcements: Announcement[] = (data || []).map(msg => ({
        id: msg.id,
        classId: msg.class_id,
        teacherId: msg.sender_id,
        title: msg.subject || "Announcement",
        content: msg.content,
        targetAudience: "parents",
        priority: "medium",
        createdAt: msg.created_at,
        class: msg.class,
        teacher: msg.sender,
      }));

      return {
        data: announcements,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    },
    enabled: !!user?.id,
  });
}

export function useAnnouncement(announcementId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["announcement", announcementId],
    queryFn: async (): Promise<Announcement | null> => {
      if (!user?.id || !announcementId) throw new Error("Missing required data");

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey (*),
          class:classes!inner (*)
        `)
        .eq("id", announcementId)
        .eq("message_type", "announcement")
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }

      return {
        id: data.id,
        classId: data.class_id,
        teacherId: data.sender_id,
        title: data.subject || "Announcement",
        content: data.content,
        targetAudience: "parents",
        priority: "medium",
        createdAt: data.created_at,
        class: data.class,
        teacher: data.sender,
      };
    },
    enabled: !!user?.id && !!announcementId,
  });
}

export function useMarkAnnouncementAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ announcementId, isRead }: { announcementId: string; isRead: boolean }) => {
      // For announcements, we might track read status in a separate table
      // For now, just mark the message as read
      const { error } = await supabase
        .from("messages")
        .update({ is_read: isRead })
        .eq("id", announcementId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcement"] });
    },
  });
}

export function useUnreadAnnouncementsCount() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["unread-announcements-count", user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;

      // Get parent's linked children class IDs
      const { data: linkedChildren } = await supabase
        .from("parent_student_link")
        .select(`
          student:students (
            class_id
          )
        `)
        .eq("parent_id", user.id);

      const classIds = linkedChildren?.map(link => link.student.class_id).filter(Boolean) || [];

      if (classIds.length === 0) return 0;

      const { count, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("message_type", "announcement")
        .in("class_id", classIds)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Check every 30 seconds
  });
}