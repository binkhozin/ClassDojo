import { z } from "zod";

// Message validation schema
export const messageSchema = z.object({
  recipientId: z.string().min(1, "Please select a recipient"),
  subject: z.string().max(255, "Subject must be less than 255 characters"),
  content: z.string().min(1, "Message content is required").max(2000, "Message must be less than 2000 characters"),
  messageType: z.enum(["general", "behavior_report", "progress_report", "announcement"]).default("general"),
  relatedStudentId: z.string().optional(),
  classId: z.string().optional(),
});

// Announcement validation schema
export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(1, "Content is required").max(5000, "Content must be less than 5000 characters"),
  targetAudience: z.enum(["class", "parents", "specific"]),
  classId: z.string().min(1, "Please select a class"),
  recipientIds: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

// Progress report validation schema
export const progressReportSchema = z.object({
  studentIds: z.array(z.string()).min(1, "Please select at least one student"),
  period: z.enum(["weekly", "monthly", "quarterly", "custom"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  templateId: z.string().optional(),
  sections: z.array(z.object({
    title: z.string().min(1, "Section title is required"),
    content: z.string().min(1, "Section content is required"),
    type: z.enum(["behavior_summary", "academic_progress", "social_emotional", "engagement", "custom"]),
    order: z.number(),
    isRequired: z.boolean(),
  })),
  includeSections: z.array(z.string()).min(1, "Please select at least one section to include"),
  sendTo: z.array(z.string()).min(1, "Please select recipients"),
  scheduleSend: z.boolean().default(false),
  scheduledDate: z.string().optional(),
});

// Parent profile validation schema
export const parentProfileSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().optional(),
  avatar_url: z.string().optional(),
  notificationPreferences: z.object({
    behaviors: z.boolean().default(true),
    rewards: z.boolean().default(true),
    messages: z.boolean().default(true),
    reports: z.boolean().default(true),
    announcements: z.boolean().default(true),
    deliveryMethod: z.enum(["in_app", "email", "sms", "all"]).default("in_app"),
    digestFrequency: z.enum(["immediate", "daily", "weekly"]).default("immediate"),
    doNotDisturbStart: z.string().optional(),
    doNotDisturbEnd: z.string().optional(),
  }),
});

// Student details validation schema
export const studentDetailsSchema = z.object({
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

// Report template validation schema
export const reportTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters"),
  sections: z.array(z.object({
    title: z.string().min(1, "Section title is required"),
    type: z.enum(["behavior_summary", "academic_progress", "social_emotional", "engagement", "custom"]),
    description: z.string().optional(),
    order: z.number(),
    isRequired: z.boolean().default(false),
    customFields: z.array(z.string()).optional(),
  })).min(1, "Please add at least one section"),
  isDefault: z.boolean().default(false),
});

// Child linking validation schema
export const linkChildSchema = z.object({
  studentCode: z.string().min(1, "Student code is required"),
  relationship: z.enum(["mother", "father", "guardian", "other"]),
  relationshipDescription: z.string().optional(),
});

// Search and filter validation schemas
export const messageSearchSchema = z.object({
  query: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  messageType: z.enum(["general", "behavior_report", "progress_report", "announcement"]).optional(),
  isRead: z.boolean().optional(),
  studentId: z.string().optional(),
});

export const conversationFilterSchema = z.object({
  archived: z.boolean().default(false),
  sortBy: z.enum(["date", "unread", "alphabetical"]).default("date"),
  showUnreadOnly: z.boolean().default(false),
});

// Activity feed filter schema
export const activityFilterSchema = z.object({
  type: z.enum(["behavior", "reward", "badge", "message", "announcement", "report"]).optional(),
  studentId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  behaviors: z.object({
    enabled: z.boolean().default(true),
    immediate: z.boolean().default(true),
    dailyDigest: z.boolean().default(false),
    weeklyDigest: z.boolean().default(false),
  }),
  rewards: z.object({
    enabled: z.boolean().default(true),
    immediate: z.boolean().default(true),
    dailyDigest: z.boolean().default(false),
    weeklyDigest: z.boolean().default(false),
  }),
  messages: z.object({
    enabled: z.boolean().default(true),
    immediate: z.boolean().default(true),
    email: z.boolean().default(false),
    sms: z.boolean().default(false),
  }),
  reports: z.object({
    enabled: z.boolean().default(true),
    immediate: z.boolean().default(true),
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  announcements: z.object({
    enabled: z.boolean().default(true),
    immediate: z.boolean().default(true),
    email: z.boolean().default(false),
    sms: z.boolean().default(false),
  }),
  doNotDisturb: z.object({
    enabled: z.boolean().default(false),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    days: z.array(z.number()).optional(), // 0-6 for Sunday-Saturday
  }),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    return allowedTypes.includes(file.type);
  }, "File type not supported"),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
});

// Custom hook for form validation
export type MessageFormData = z.infer<typeof messageSchema>;
export type AnnouncementFormData = z.infer<typeof announcementSchema>;
export type ProgressReportFormData = z.infer<typeof progressReportSchema>;
export type ParentProfileFormData = z.infer<typeof parentProfileSchema>;
export type StudentDetailsFormData = z.infer<typeof studentDetailsSchema>;
export type LinkChildFormData = z.infer<typeof linkChildSchema>;
export type MessageSearchFormData = z.infer<typeof messageSearchSchema>;
export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;