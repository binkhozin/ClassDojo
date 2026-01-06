import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageWithDetails, Conversation, SearchFilters, PaginatedResponse } from "@/types";
import { toast } from "sonner";

export function useParentMessages(options: { 
  filters?: SearchFilters;
  page?: number;
  limit?: number;
} = {}) {
  const { user } = useAuth();
  const { filters = {}, page = 1, limit = 20 } = options;
  
  return useQuery({
    queryKey: ["parent-messages", user?.id, filters, page, limit],
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
        .eq("recipient_id", user.id);

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

export function useConversation(conversationId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async (): Promise<{ messages: MessageWithDetails[]; participants: any[] }> => {
      if (!user?.id || !conversationId) throw new Error("Missing required data");

      // For now, we'll treat conversationId as the related_student_id
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
        .or(`related_student_id.eq.${conversationId}`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get unique participants
      const participants = new Map();
      data?.forEach(message => {
        if (message.sender) participants.set(message.sender.id, message.sender);
        if (message.recipient) participants.set(message.recipient.id, message.recipient);
      });

      return {
        messages: data || [],
        participants: Array.from(participants.values()),
      };
    },
    enabled: !!user?.id && !!conversationId,
  });
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageData: {
      recipientId: string;
      subject?: string;
      content: string;
      messageType?: string;
      relatedStudentId?: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: messageData.recipientId,
          subject: messageData.subject,
          content: messageData.content,
          message_type: messageData.messageType || "general",
          related_student_id: messageData.relatedStudentId,
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
    onSuccess: (data) => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ["parent-messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
      
      // Show success message
      toast.success("Message sent successfully");
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    },
  });
}

export function useMarkMessageAsRead() {
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
      // Invalidate messages to refetch
      queryClient.invalidateQueries({ queryKey: ["parent-messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
      
      // Update cache directly for better UX
      queryClient.setQueriesData(
        { queryKey: ["parent-messages"] },
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

export function useMarkAllMessagesAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-messages"] });
      toast.success("All messages marked as read");
    },
    onError: (error) => {
      console.error("Error marking messages as read:", error);
      toast.error("Failed to mark messages as read");
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
      toast.success("Message deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    },
  });
}

export function useConversations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      // Get all messages for the user and group them by conversation
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey (*),
          recipient:users!messages_recipient_id_fkey (*),
          related_student:students (*)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group messages by conversation (for now, by related_student_id or participant)
      const conversationMap = new Map();

      data?.forEach((message) => {
        const otherParticipant = message.sender_id === user.id ? message.recipient : message.sender;
        const conversationKey = `${message.related_student_id || otherParticipant?.id || 'general'}_${user.id}`;

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            participantIds: [user.id, otherParticipant?.id].filter(Boolean),
            lastMessage: message,
            unreadCount: 0,
            createdAt: message.created_at,
            updatedAt: message.created_at,
            relatedStudentId: message.related_student_id,
          });
        }

        // Count unread messages
        if (message.recipient_id === user.id && !message.is_read) {
          conversationMap.get(conversationKey).unreadCount++;
        }

        // Update last message if this one is newer
        if (new Date(message.created_at) > new Date(conversationMap.get(conversationKey).updatedAt)) {
          conversationMap.get(conversationKey).lastMessage = message;
          conversationMap.get(conversationKey).updatedAt = message.created_at;
        }
      });

      return Array.from(conversationMap.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },
    enabled: !!user?.id,
  });
}

export function useTypingIndicator(conversationId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["typing-indicator", conversationId],
    queryFn: async () => {
      // This would typically use Supabase realtime or websockets
      // For now, return empty array
      return [];
    },
    enabled: !!user?.id && !!conversationId,
    refetchInterval: 2000, // Check every 2 seconds
  });
}

export function useMessageSearch(query: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["message-search", user?.id, query],
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