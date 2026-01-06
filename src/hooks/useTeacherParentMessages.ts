import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { MessageWithDetails, SearchFilters, PaginatedResponse } from "@/types";
import { toast } from "sonner";

export interface ParentConversation {
  id: string;
  parentId: string;
  parent: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    phone: string | null;
  };
  student: {
    id: string;
    first_name: string;
    last_name: string;
    class: {
      id: string;
      name: string;
    } | null;
  };
  lastMessage?: MessageWithDetails;
  unreadCount: number;
  messageType?: string;
  priority?: "high" | "normal" | "low";
  createdAt: string;
  updatedAt: string;
}

export function useTeacherParentMessages(options: {
  filters?: SearchFilters;
  page?: number;
  limit?: number;
} = {}) {
  const { user } = useAuth();
  const { filters = {}, page = 1, limit = 20 } = options;

  return useQuery({
    queryKey: ["teacher-parent-messages", user?.id, filters, page, limit],
    queryFn: async (): Promise<PaginatedResponse<MessageWithDetails>> => {
      if (!user?.id) throw new Error("User not authenticated");

      let query = supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey (*),
          recipient:users!messages_recipient_id_fkey (*),
          related_student:students (*),
          class:classes (*)
        `)
        .eq("sender_id", user.id);

      // Apply filters
      if (filters.query) {
        query = query.or(`content.ilike.%${filters.query}%,subject.ilike.%${filters.query}%`);
      }
      if (filters.isRead !== undefined) {
        query = query.eq("is_read", filters.isRead);
      }
      if (filters.messageType) {
        query = query.eq("message_type", filters.messageType);
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

      return {
        data: data || [],
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

export function useTeacherConversations(filters?: {
  classId?: string;
  unreadOnly?: boolean;
  searchQuery?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teacher-conversations", user?.id, filters],
    queryFn: async (): Promise<ParentConversation[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      // First, get all students taught by this teacher
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select(`
          id,
          first_name,
          last_name,
          class_id,
          classes:class_id (
            id,
            name
          ),
          parent_student_links (
            parent_id,
            parents:parent_id (
              id,
              full_name,
              email,
              avatar_url,
              phone
            )
          )
        `)
        .eq("teacher_id", user.id);

      if (studentsError) throw studentsError;

      // Get all messages involving these students/parents
      const studentIds = students?.map(s => s.id) || [];
      const parentIds = students?.flatMap(s => 
        s.parent_student_links?.map(l => l.parent_id) || []
      ) || [];

      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey (*),
          recipient:users!messages_recipient_id_fkey (*),
          related_student:students (*),
          class:classes (*)
        `)
        .or(`related_student_id.in.(${studentIds.join(',')}),sender_id.in.(${parentIds.join(',')}),recipient_id.in.(${parentIds.join(',')})`)
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages into conversations by parent-student relationship
      const conversationMap = new Map<string, ParentConversation>();

      students?.forEach(student => {
        student.parent_student_links?.forEach(link => {
          if (!link.parents) return;

          const parent = link.parents;
          const key = `${student.id}_${parent.id}`;

          // Find the most recent message for this conversation
          const conversationMessages = messages?.filter(m => 
            m.related_student_id === student.id &&
            (m.sender_id === parent.id || m.recipient_id === parent.id || m.sender_id === user.id)
          ) || [];

          const lastMessage = conversationMessages[0];

          // Count unread messages (messages from parent not read by teacher)
          const unreadCount = conversationMessages.filter(m =>
            m.sender_id === parent.id && !m.is_read && m.recipient_id === user.id
          ).length;

          if (!conversationMap.has(key)) {
            conversationMap.set(key, {
              id: key,
              parentId: parent.id,
              parent,
              student: {
                id: student.id,
                first_name: student.first_name,
                last_name: student.last_name,
                class: student.classes || null,
              },
              lastMessage,
              unreadCount,
              messageType: lastMessage?.message_type,
              priority: lastMessage?.priority as any,
              createdAt: lastMessage?.created_at || student.created_at,
              updatedAt: lastMessage?.created_at || student.created_at,
            });
          } else {
            // Update if this message is newer
            const conv = conversationMap.get(key)!;
            if (lastMessage && new Date(lastMessage.created_at) > new Date(conv.updatedAt)) {
              conv.lastMessage = lastMessage;
              conv.updatedAt = lastMessage.created_at;
              conv.messageType = lastMessage.message_type;
              conv.priority = lastMessage.priority as any;
            }
            conv.unreadCount = unreadCount;
          }
        });
      });

      let conversations = Array.from(conversationMap.values());

      // Apply filters
      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        conversations = conversations.filter(conv =>
          conv.parent.full_name.toLowerCase().includes(query) ||
          conv.student.first_name.toLowerCase().includes(query) ||
          conv.student.last_name.toLowerCase().includes(query) ||
          conv.lastMessage?.content?.toLowerCase().includes(query)
        );
      }

      if (filters?.classId) {
        conversations = conversations.filter(conv =>
          conv.student.class?.id === filters.classId
        );
      }

      if (filters?.unreadOnly) {
        conversations = conversations.filter(conv => conv.unreadCount > 0);
      }

      // Sort by most recent activity
      conversations.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return conversations;
    },
    enabled: !!user?.id,
  });
}

export function useSendParentMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: {
      parentId: string;
      studentId?: string;
      subject?: string;
      content: string;
      messageType?: string;
      priority?: "high" | "normal" | "low";
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: messageData.parentId,
          subject: messageData.subject,
          content: messageData.content,
          message_type: messageData.messageType || "general",
          related_student_id: messageData.studentId,
          priority: messageData.priority || "normal",
          is_read: false,
        })
        .select(`
          *,
          sender:users!messages_sender_id_fkey (*),
          recipient:users!messages_recipient_id_fkey (*),
          related_student:students (*),
          class:classes (*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-parent-messages"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-conversations"] });
      toast.success("Message sent successfully");
    },
    onError: (error) => {
      console.error("Error sending parent message:", error);
      toast.error("Failed to send message");
    },
  });
}

export function useMarkParentMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, isRead }: { messageId: string; isRead: boolean }) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: isRead })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-parent-messages"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-conversations"] });

      queryClient.setQueriesData(
        { queryKey: ["teacher-parent-messages"] },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((message: MessageWithDetails) =>
              message.id === variables.messageId
                ? { ...message, is_read: variables.isRead }
                : message
            ),
          };
        }
      );
    },
  });
}

export function useMarkAllParentMessagesAsRead(parentId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      let query = supabase
        .from("messages")
        .update({ is_read: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      if (parentId) {
        query = query.eq("sender_id", parentId);
      }

      const { error } = await query;

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-parent-messages"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-conversations"] });
      toast.success("All messages marked as read");
    },
  });
}

export function useTeacherMessageSearch(query: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teacher-message-search", user?.id, query],
    queryFn: async (): Promise<MessageWithDetails[]> => {
      if (!user?.id || !query.trim()) return [];

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey (*),
          recipient:users!messages_recipient_id_fkey (*),
          related_student:students (*),
          class:classes (*)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`content.ilike.%${query}%,subject.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!query.trim(),
    staleTime: 30000,
  });
}
