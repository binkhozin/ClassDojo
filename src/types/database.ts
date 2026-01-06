export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "teacher" | "parent" | "student" | "admin";
export type BehaviorType = "positive" | "negative";
export type MessageType = "general" | "announcement" | "behavior_report" | "progress_report";
export type NotificationType = "behavior_alert" | "message" | "reward" | "announcement";
export type ResetFrequency = "daily" | "weekly" | "monthly" | "never";
export type ParentAccess = "view_only" | "full_access";
export type RelationshipType = "mother" | "father" | "guardian" | "other";
export type RequirementType = "points_threshold" | "behavior_count" | "achievement";
export type ReportPeriod = "weekly" | "monthly" | "term";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          school_name: string | null;
          grade_level: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          school_name?: string | null;
          grade_level?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          school_name?: string | null;
          grade_level?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          granted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRole;
          granted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRole;
          granted_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          teacher_id: string;
          name: string;
          grade: string | null;
          description: string | null;
          school_name: string | null;
          academic_year: string;
          color: string | null;
          max_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          name: string;
          grade?: string | null;
          description?: string | null;
          school_name?: string | null;
          academic_year: string;
          color?: string | null;
          max_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          name?: string;
          grade?: string | null;
          description?: string | null;
          school_name?: string | null;
          academic_year?: string;
          color?: string | null;
          max_points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      class_settings: {
        Row: {
          id: string;
          class_id: string;
          points_per_good_behavior: number;
          points_per_bad_behavior: number;
          reset_frequency: ResetFrequency;
          reset_day: number | null;
          notifications_enabled: boolean;
          parent_access: ParentAccess;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          points_per_good_behavior?: number;
          points_per_bad_behavior?: number;
          reset_frequency?: ResetFrequency;
          reset_day?: number | null;
          notifications_enabled?: boolean;
          parent_access?: ParentAccess;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          points_per_good_behavior?: number;
          points_per_bad_behavior?: number;
          reset_frequency?: ResetFrequency;
          reset_day?: number | null;
          notifications_enabled?: boolean;
          parent_access?: ParentAccess;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          class_id: string;
          user_id: string | null;
          first_name: string;
          last_name: string;
          email: string | null;
          date_of_birth: string | null;
          avatar_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          user_id?: string | null;
          first_name: string;
          last_name: string;
          email?: string | null;
          date_of_birth?: string | null;
          avatar_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          user_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          date_of_birth?: string | null;
          avatar_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      parent_student_link: {
        Row: {
          id: string;
          parent_id: string;
          student_id: string;
          relationship: RelationshipType;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          student_id: string;
          relationship: RelationshipType;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          student_id?: string;
          relationship?: RelationshipType;
          created_at?: string;
        };
      };
      behavior_categories: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          description: string | null;
          point_value: number;
          type: BehaviorType;
          icon: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          name: string;
          description?: string | null;
          point_value?: number;
          type: BehaviorType;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          name?: string;
          description?: string | null;
          point_value?: number;
          type?: BehaviorType;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      behaviors: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          category_id: string;
          teacher_id: string;
          points: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id: string;
          category_id: string;
          teacher_id: string;
          points: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          class_id?: string;
          category_id?: string;
          teacher_id?: string;
          points?: number;
          note?: string | null;
          created_at?: string;
        };
      };
      behavior_snapshots: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          total_points: number;
          good_behaviors: number;
          bad_behaviors: number;
          rank: number;
          snapshot_date: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          total_points?: number;
          good_behaviors?: number;
          bad_behaviors?: number;
          rank: number;
          snapshot_date: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string;
          total_points?: number;
          good_behaviors?: number;
          bad_behaviors?: number;
          rank?: number;
          snapshot_date?: string;
          updated_at?: string;
        };
      };
      rewards: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          description: string | null;
          point_cost: number;
          icon: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          name: string;
          description?: string | null;
          point_cost: number;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          name?: string;
          description?: string | null;
          point_cost?: number;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      student_rewards: {
        Row: {
          id: string;
          student_id: string;
          reward_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          reward_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          reward_id?: string;
          earned_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          requirement_type: RequirementType;
          requirement_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          requirement_type: RequirementType;
          requirement_value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          requirement_type?: RequirementType;
          requirement_value?: number;
          created_at?: string;
        };
      };
      student_badges: {
        Row: {
          id: string;
          student_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          subject: string | null;
          content: string;
          message_type: MessageType;
          related_student_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          subject?: string | null;
          content: string;
          message_type: MessageType;
          related_student_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          subject?: string | null;
          content?: string;
          message_type?: MessageType;
          related_student_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          content: string;
          related_data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          content: string;
          related_data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          content?: string;
          related_data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          class_id: string;
          created_by: string;
          title: string;
          description: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          created_by: string;
          title: string;
          description: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          created_by?: string;
          title?: string;
          description?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignment_submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          submitted_at: string | null;
          grade: number | null;
          feedback: string | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          submitted_at?: string | null;
          grade?: number | null;
          feedback?: string | null;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          submitted_at?: string | null;
          grade?: number | null;
          feedback?: string | null;
        };
      };
      progress_reports: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          teacher_id: string;
          period: ReportPeriod;
          content: string;
          total_points: number;
          good_behaviors: number;
          bad_behaviors: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id: string;
          teacher_id: string;
          period: ReportPeriod;
          content: string;
          total_points: number;
          good_behaviors: number;
          bad_behaviors: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          class_id?: string;
          teacher_id?: string;
          period?: ReportPeriod;
          content?: string;
          total_points?: number;
          good_behaviors?: number;
          bad_behaviors?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_: string]: never;
    };
    Functions: {
      [_: string]: never;
    };
    Enums: {
      user_role: UserRole;
      behavior_type: BehaviorType;
      message_type: MessageType;
      notification_type: NotificationType;
      reset_frequency: ResetFrequency;
      parent_access: ParentAccess;
      relationship_type: RelationshipType;
      requirement_type: RequirementType;
      report_period: ReportPeriod;
    };
  };
}
