import type { Database } from "./database";

// Table types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Class = Database["public"]["Tables"]["classes"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type Behavior = Database["public"]["Tables"]["behaviors"]["Row"];
export type BehaviorCategory = Database["public"]["Tables"]["behavior_categories"]["Row"];
export type Reward = Database["public"]["Tables"]["rewards"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
export type ProgressReport = Database["public"]["Tables"]["progress_reports"]["Row"];
export type ParentStudentLink = Database["public"]["Tables"]["parent_student_link"]["Row"];
export type StudentReward = Database["public"]["Tables"]["student_rewards"]["Row"];
export type StudentBadge = Database["public"]["Tables"]["student_badges"]["Row"];

// Insert types
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type ClassInsert = Database["public"]["Tables"]["classes"]["Insert"];
export type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
export type BehaviorInsert = Database["public"]["Tables"]["behaviors"]["Insert"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
export type ProgressReportInsert = Database["public"]["Tables"]["progress_reports"]["Insert"];

// Update types
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type ClassUpdate = Database["public"]["Tables"]["classes"]["Update"];
export type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];

// Enum types
export * from "./auth";
export type {
  UserRole,
  BehaviorType,
  MessageType,
  NotificationType,
  ResetFrequency,
  ParentAccess,
  RelationshipType,
  RequirementType,
  ReportPeriod,
} from "./database";

// Extended types with relations
export interface StudentWithPoints extends Student {
  total_points?: number;
  rank?: number;
  behavior_snapshots?: {
    total_points: number;
    good_behaviors: number;
    bad_behaviors: number;
    rank: number;
    snapshot_date: string;
  }[];
}

export interface ClassWithSettings extends Class {
  settings?: Database["public"]["Tables"]["class_settings"]["Row"];
}

export interface BehaviorWithDetails extends Behavior {
  category?: BehaviorCategory;
  student?: Student;
  teacher?: User;
}

export interface MessageWithDetails extends Message {
  sender?: User;
  recipient?: User;
  related_student?: Student;
  class?: Class;
}

export interface NotificationWithDetails extends Notification {
  related_user?: User;
}

export interface StudentWithDetails extends Student {
  class?: Class;
  teacher?: User;
  parent_links?: ParentStudentLink[];
  total_points?: number;
  current_rank?: number;
  recent_behaviors?: BehaviorWithDetails[];
  earned_rewards?: StudentReward[];
  earned_badges?: StudentBadge[];
}

export interface ParentWithChildren extends User {
  linked_students?: StudentWithDetails[];
  notification_preferences?: NotificationPreferences;
}

// Extended types for messaging system
export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: MessageWithDetails;
  unreadCount: number;
  archivedBy?: string[];
  createdAt: string;
  updatedAt: string;
  relatedStudentId?: string;
  classId?: string;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Announcement {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  content: string;
  targetAudience: 'class' | 'parents' | 'specific';
  recipientIds?: string[];
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  isRead?: boolean;
  createdAt: string;
  class?: Class;
  teacher?: User;
}

export interface ParentProfile {
  id: string;
  userId: string;
  phoneNumber?: string;
  notificationPreferences: NotificationPreferences;
  linkedChildren: string[]; // student IDs
}

export interface NotificationPreferences {
  behaviors: boolean;
  rewards: boolean;
  messages: boolean;
  reports: boolean;
  announcements: boolean;
  deliveryMethod: 'in_app' | 'email' | 'sms' | 'all';
  digestFrequency: 'immediate' | 'daily' | 'weekly';
  doNotDisturbStart?: string;
  doNotDisturbEnd?: string;
}

export interface ProgressReportSection {
  id: string;
  title: string;
  content: string;
  type: 'behavior_summary' | 'academic_progress' | 'social_emotional' | 'engagement' | 'custom';
  order: number;
}

export interface ProgressReportWithDetails extends ProgressReport {
  student?: Student;
  teacher?: User;
  class?: Class;
  sections?: ProgressReportSection[];
  sentTo?: User[];
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  isTyping: boolean;
}

export interface MessageStatus {
  messageId: string;
  deliveredAt?: string;
  readAt?: string;
  status: 'sent' | 'delivered' | 'read';
}

// Activity feed types
export interface ActivityFeedItem {
  id: string;
  type: 'behavior' | 'reward' | 'badge' | 'message' | 'announcement' | 'report';
  studentId: string;
  student?: Student;
  data: any;
  createdAt: string;
  isRead?: boolean;
}

export interface StudentProgress {
  studentId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  totalPoints: number;
  pointChange: number;
  goodBehaviors: number;
  badBehaviors: number;
  rankChange: number;
  currentRank?: number;
  rewardsEarned: number;
  badgesEarned: number;
  streakDays?: number;
  classAverage?: number;
}

// Dashboard data types
export interface ParentDashboardData {
  parent: ParentWithChildren;
  children: StudentWithDetails[];
  totalPoints: number;
  unreadMessages: number;
  recentActivities: ActivityFeedItem[];
  upcomingAnnouncements: Announcement[];
}

// Report template types
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSectionTemplate[];
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ReportSectionTemplate {
  id: string;
  title: string;
  type: 'behavior_summary' | 'academic_progress' | 'social_emotional' | 'engagement' | 'custom';
  description?: string;
  order: number;
  isRequired: boolean;
  customFields?: string[];
}

// Utility types
export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  studentId?: string;
  classId?: string;
  messageType?: MessageType;
  isRead?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}