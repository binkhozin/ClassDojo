export interface BehaviorLog {
  id: string;
  studentId: string;
  classId: string;
  categoryId: string;
  teacherId: string;
  points: number;
  note?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  classId: string;
  name: string;
  description?: string;
  pointCost: number;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Badge {
  id: string;
  classId: string;
  name: string;
  description?: string;
  icon?: string;
  requirementType: 'points_threshold' | 'behavior_count' | 'achievement';
  requirementValue: number;
  createdAt: string;
}

export interface StudentStats {
  totalPoints: number;
  goodBehaviors: number;
  badBehaviors: number;
  rewards: number;
  badges: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  totalPoints: number;
  goodBehaviors: number;
  badBehaviors: number;
  trend: 'up' | 'down' | 'same';
}

export interface RewardRedemption {
  id: string;
  studentId: string;
  rewardId: string;
  redeemedAt: string;
  pointsDeducted: number;
}

export interface BadgeAward {
  id: string;
  studentId: string;
  badgeId: string;
  awardedAt: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastBehaviorDate: string | null;
  streakMilestones: {
    threeDay: boolean;
    weekly: boolean;
    monthly: boolean;
  };
}

export interface LeaderboardFilter {
  timePeriod: 'today' | 'week' | 'month' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
  classId?: string;
}

export interface BehaviorFilter {
  studentId?: string;
  categoryId?: string;
  behaviorType?: 'positive' | 'negative';
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'behavior_logged' | 'reward_redeemed' | 'badge_earned' | 'milestone_achieved' | 'streak_broken';
  title: string;
  content: string;
  relatedData: any;
  isRead: boolean;
  createdAt: string;
}