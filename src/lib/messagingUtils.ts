import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";
import type { Message, MessageWithDetails, Conversation, TypingIndicator } from "@/types";

// Message formatting utilities
export function formatMessageTimestamp(timestamp: string): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE'); // Day of week
  } else {
    return format(date, 'MMM d'); // Month and day
  }
}

export function formatMessageTimeShort(timestamp: string): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
  return format(date, 'h:mm a');
}

export function formatRelativeTime(timestamp: string): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
  return formatDistanceToNow(date, { addSuffix: true });
}

// Message status utilities
export function getMessageStatus(message: MessageWithDetails, currentUserId: string): {
  status: 'sent' | 'delivered' | 'read';
  timestamp?: string;
} {
  if (message.sender_id !== currentUserId) {
    return { status: 'delivered' }; // For received messages, we show as delivered
  }

  // For sent messages, determine status based on read status
  return {
    status: message.is_read ? 'read' : 'delivered',
    timestamp: message.updated_at,
  };
}

export function getMessageStatusIcon(status: 'sent' | 'delivered' | 'read'): string {
  switch (status) {
    case 'sent':
      return '✓'; // Single checkmark
    case 'delivered':
      return '✓✓'; // Double checkmark (gray)
    case 'read':
      return '✓✓'; // Double checkmark (blue)
    default:
      return '';
  }
}

export function getMessageStatusColor(status: 'sent' | 'delivered' | 'read'): string {
  switch (status) {
    case 'sent':
      return 'text-gray-400';
    case 'delivered':
      return 'text-gray-500';
    case 'read':
      return 'text-blue-500';
    default:
      return 'text-gray-400';
  }
}

// Conversation utilities
export function getConversationTitle(conversation: Conversation, currentUserId: string): string {
  if (conversation.participantIds.length === 2) {
    // Find the other participant
    const otherParticipantId = conversation.participantIds.find(id => id !== currentUserId);
    return otherParticipantId || "Unknown User";
  }
  
  if (conversation.relatedStudentId) {
    return "Student Discussion";
  }
  
  return "General Discussion";
}

export function getConversationParticipants(conversation: Conversation, allUsers: any[]): any[] {
  return allUsers.filter(user => conversation.participantIds.includes(user.id));
}

// Message content utilities
export function truncateMessageContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

export function highlightMentions(content: string): string {
  // Simple mention highlighting - you can enhance this
  return content.replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>');
}

export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

// Message templates
export const MESSAGE_TEMPLATES = {
  general: {
    subject: "",
    content: "",
  },
  behavior_report: {
    subject: "Behavior Report - {studentName}",
    content: `Dear {parentName},

I wanted to share a behavior report for {studentName} from today.

**Behavior Details:**
- Type: {behaviorType}
- Points: {points}
- Notes: {notes}

**Class Context:**
{classContext}

Please let me know if you have any questions or concerns.

Best regards,
{teacherName}`,
  },
  progress_report: {
    subject: "Progress Report - {studentName} - {period}",
    content: `Dear {parentName},

Please find the progress report for {studentName} for the period of {startDate} to {endDate}.

**Summary:**
{summary}

**Areas of Strength:**
{strengths}

**Areas for Improvement:**
{improvements}

**Recommendations:**
{recommendations}

Thank you for your continued support.

Best regards,
{teacherName}`,
  },
  behavioral_concern: {
    subject: "Behavioral Concern - {studentName}",
    content: `Dear {parentName},

I would like to discuss a behavioral concern regarding {studentName}.

**Concern Details:**
{concernDetails}

**Recent Observations:**
{observations}

**Suggested Support:**
{supportSuggestions}

I would appreciate the opportunity to discuss this further and work together to support {studentName}'s success.

Please let me know when would be a good time for a call or meeting.

Best regards,
{teacherName}`,
  },
  positive_feedback: {
    subject: "Positive Update - {studentName}",
    content: `Dear {parentName},

I wanted to share some wonderful news about {studentName}!

**Positive Highlights:**
{highlights}

**Specific Achievements:**
{achievements}

{studentName} has been making excellent progress and it's been a joy to have them in class.

Keep up the great work!

Best regards,
{teacherName}`,
  },
  event_announcement: {
    subject: "Upcoming Event - {eventName}",
    content: `Dear Parents,

I wanted to inform you about an upcoming event:

**Event:** {eventName}
**Date:** {eventDate}
**Time:** {eventTime}
**Location:** {eventLocation}

**Details:**
{eventDetails}

Please let me know if you have any questions.

Best regards,
{teacherName}`,
  },
} as const;

export function generateMessageFromTemplate(
  templateType: keyof typeof MESSAGE_TEMPLATES,
  variables: Record<string, string>
): { subject: string; content: string } {
  const template = MESSAGE_TEMPLATES[templateType];
  
  let subject = template.subject;
  let content = template.content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    content = content.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return { subject, content };
}

// Typing indicators
export function formatTypingIndicator(typingUsers: TypingIndicator[]): string {
  if (typingUsers.length === 0) return '';
  if (typingUsers.length === 1) {
    return `${typingUsers[0].userName} is typing...`;
  }
  if (typingUsers.length === 2) {
    return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
  }
  return `${typingUsers.length} people are typing...`;
}

// Message search utilities
export function highlightSearchTerms(content: string, searchTerm: string): string {
  if (!searchTerm.trim()) return content;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return content.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

export function filterMessagesBySearch(messages: MessageWithDetails[], searchTerm: string): MessageWithDetails[] {
  if (!searchTerm.trim()) return messages;
  
  const term = searchTerm.toLowerCase();
  return messages.filter(message =>
    message.content.toLowerCase().includes(term) ||
    (message.subject && message.subject.toLowerCase().includes(term))
  );
}

// Notification message generators
export function generateNotificationMessage(
  type: 'behavior' | 'reward' | 'badge' | 'message' | 'announcement',
  data: any
): string {
  switch (type) {
    case 'behavior':
      return `Your child ${data.studentName} earned ${data.points} points for ${data.behaviorName}`;
    case 'reward':
      return `Your child ${data.studentName} earned the reward: ${data.rewardName}`;
    case 'badge':
      return `Your child ${data.studentName} earned a new badge: ${data.badgeName}`;
    case 'message':
      return `New message from ${data.teacherName} about ${data.studentName}`;
    case 'announcement':
      return `New announcement: ${data.title}`;
    default:
      return 'New notification';
  }
}

// File upload utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.startsWith('text/')) return '📝';
  if (fileType.includes('word')) return '📄';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
  return '📎';
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

// Date utilities for messaging
export function getMessageDateGroups(messages: MessageWithDetails[]): Record<string, MessageWithDetails[]> {
  const groups: Record<string, MessageWithDetails[]> = {};
  
  messages.forEach(message => {
    const date = typeof message.created_at === 'string' ? parseISO(message.created_at) : message.created_at;
    let groupKey: string;
    
    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else if (isThisWeek(date)) {
      groupKey = format(date, 'EEEE'); // Day of week
    } else {
      groupKey = format(date, 'MMMM d, yyyy'); // Full date
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(message);
  });
  
  return groups;
}

// Validation utilities
export function validateMessageContent(content: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!content.trim()) {
    errors.push('Message content cannot be empty');
  }
  
  if (content.length > 2000) {
    errors.push('Message content must be less than 2000 characters');
  }
  
  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (content.length > 20 && capsRatio > 0.7) {
    errors.push('Please avoid using excessive capital letters');
  }
  
  // Check for spam patterns (multiple exclamation marks, etc.)
  if (/[!]{3,}/.test(content)) {
    errors.push('Please avoid excessive exclamation marks');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Real-time utilities
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}