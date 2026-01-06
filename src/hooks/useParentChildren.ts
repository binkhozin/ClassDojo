import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StudentWithDetails, ParentDashboardData, SearchFilters, PaginatedResponse } from "@/types";
import { toast } from "sonner";

export function useParentChildren() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["parent-children", user?.id],
    queryFn: async (): Promise<StudentWithDetails[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("parent_student_link")
        .select(`
          *,
          student:students (
            *,
            class:classes (
              *,
              teacher:users!classes_teacher_id_fkey (*)
            ),
            parent_links:parent_student_link (*),
            behavior_snapshots:behavior_snapshots (
              total_points,
              good_behaviors,
              bad_behaviors,
              rank,
              snapshot_date
            ),
            recent_behaviors:behaviors (
              *,
              category:behavior_categories (*),
              teacher:users!behaviors_teacher_id_fkey (*)
            ),
            earned_rewards:student_rewards (
              *,
              reward:rewards (*)
            ),
            earned_badges:student_badges (
              *,
              badge:badges (*)
            )
          )
        `)
        .eq("parent_id", user.id);

      if (error) throw error;

      return data?.map(link => ({
        ...link.student,
        class: link.student?.class,
        teacher: link.student?.class?.teacher,
        parent_links: link.student?.parent_links,
        total_points: link.student?.behavior_snapshots?.[0]?.total_points || 0,
        current_rank: link.student?.behavior_snapshots?.[0]?.rank,
        recent_behaviors: link.student?.recent_behaviors?.slice(0, 5) || [],
        earned_rewards: link.student?.earned_rewards || [],
        earned_badges: link.student?.earned_badges || [],
      })) || [];
    },
    enabled: !!user?.id,
  });
}

export function useChildProgress(studentId: string, period: "week" | "month" | "quarter" | "year" = "month") {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["child-progress", studentId, period],
    queryFn: async () => {
      if (!user?.id || !studentId) throw new Error("Missing required data");

      const { data, error } = await supabase
        .from("behavior_snapshots")
        .select(`
          *,
          class:classes (
            name,
            teacher:users!classes_teacher_id_fkey (full_name)
          )
        `)
        .eq("student_id", studentId)
        .order("snapshot_date", { ascending: false })
        .limit(period === "week" ? 7 : period === "month" ? 30 : period === "quarter" ? 90 : 365);

      if (error) throw error;

      // Calculate progress metrics
      const snapshots = data || [];
      const current = snapshots[0];
      const previous = snapshots[1];

      const progress = {
        studentId,
        period,
        totalPoints: current?.total_points || 0,
        pointChange: (current?.total_points || 0) - (previous?.total_points || 0),
        goodBehaviors: current?.good_behaviors || 0,
        badBehaviors: current?.bad_behaviors || 0,
        rankChange: (current?.rank || 0) - (previous?.rank || 0),
        currentRank: current?.rank,
        classAverage: 0, // TODO: Calculate class average
        snapshots: snapshots.map(snapshot => ({
          date: snapshot.snapshot_date,
          points: snapshot.total_points,
          rank: snapshot.rank,
          goodBehaviors: snapshot.good_behaviors,
          badBehaviors: snapshot.bad_behaviors,
        })),
      };

      return progress;
    },
    enabled: !!user?.id && !!studentId,
  });
}

export function useParentDashboardData() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["parent-dashboard", user?.id],
    queryFn: async (): Promise<ParentDashboardData> => {
      if (!user?.id) throw new Error("User not authenticated");

      // Fetch children data
      const children = await useParentChildren().refetch();

      // Fetch unread messages count
      const { data: unreadMessages } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      // Fetch recent activities
      const { data: activities } = await supabase
        .from("notifications")
        .select(`
          *,
          related_student:students (first_name, last_name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch upcoming announcements
      const { data: announcements } = await supabase
        .from("messages")
        .select(`
          *,
          sender:users!messages_sender_id_fkey (full_name, avatar_url)
        `)
        .eq("recipient_id", user.id)
        .eq("message_type", "announcement")
        .gte("created_at", new Date().toISOString())
        .order("created_at", { ascending: true })
        .limit(5);

      const dashboardData: ParentDashboardData = {
        parent: user as any,
        children: children.data || [],
        totalPoints: (children.data || []).reduce((sum, child) => sum + (child.total_points || 0), 0),
        unreadMessages: unreadMessages?.count || 0,
        recentActivities: activities?.map(activity => ({
          id: activity.id,
          type: activity.type,
          studentId: activity.related_data?.studentId || "",
          student: activity.related_student,
          data: activity.related_data,
          createdAt: activity.created_at,
          isRead: activity.is_read,
        })) || [],
        upcomingAnnouncements: announcements?.map(msg => ({
          id: msg.id,
          classId: "",
          teacherId: msg.sender_id,
          title: msg.subject || "Announcement",
          content: msg.content,
          targetAudience: "parents",
          priority: "medium",
          createdAt: msg.created_at,
          teacher: msg.sender,
        })) || [],
      };

      return dashboardData;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}