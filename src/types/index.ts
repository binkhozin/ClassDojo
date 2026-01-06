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

// Insert types
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type ClassInsert = Database["public"]["Tables"]["classes"]["Insert"];
export type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
export type BehaviorInsert = Database["public"]["Tables"]["behaviors"]["Insert"];

// Update types
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type ClassUpdate = Database["public"]["Tables"]["classes"]["Update"];
export type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

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

export type {
  BehaviorLog as GamificationBehaviorLog,
  Reward as GamificationReward,
  Badge as GamificationBadge,
  StudentStats,
  LeaderboardEntry,
  RewardRedemption,
  BadgeAward,
  StreakInfo,
  LeaderboardFilter,
  BehaviorFilter,
  Notification as GamificationNotification,
} from "./gamification";

// Extended types with relations
export interface StudentWithPoints extends Student {
  total_points?: number;
  rank?: number;
}

export interface ClassWithSettings extends Class {
  settings?: Database["public"]["Tables"]["class_settings"]["Row"];
}

export interface BehaviorWithDetails extends Behavior {
  category?: BehaviorCategory;
  student?: Student;
  teacher?: User;
}
