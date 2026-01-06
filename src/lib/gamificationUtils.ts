import { format } from "date-fns";
import type { BehaviorWithDetails, StudentWithPoints, LeaderboardEntry, StreakInfo } from "../types";

export function calculateTotalPoints(behaviors: BehaviorWithDetails[]): number {
  return behaviors.reduce((total, behavior) => total + behavior.points, 0);
}

export function calculatePointChanges(behaviors: BehaviorWithDetails[]): number[] {
  return behaviors.map(behavior => behavior.points);
}

export function checkBadgeEligibility(
  studentPoints: number,
  goodBehaviors: number,
  badges: any[],
  studentBadges: any[]
): string[] {
  const eligibleBadges: string[] = [];
  
  for (const badge of badges) {
    const alreadyEarned = studentBadges.some((sb: any) => sb.badge_id === badge.id);
    if (alreadyEarned) continue;
    
    switch (badge.requirement_type) {
      case "points_threshold":
        if (studentPoints >= badge.requirement_value) {
          eligibleBadges.push(badge.id);
        }
        break;
      case "behavior_count":
        if (goodBehaviors >= badge.requirement_value) {
          eligibleBadges.push(badge.id);
        }
        break;
      case "achievement":
        // For achievement-based badges, we might need additional logic
        // For now, we'll assume they're awarded manually
        break;
    }
  }
  
  return eligibleBadges;
}

export function calculateStreaks(behaviors: BehaviorWithDetails[]): StreakInfo {
  if (behaviors.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastBehaviorDate: null,
      streakMilestones: {
        threeDay: false,
        weekly: false,
        monthly: false,
      },
    };
  }
  
  // Sort behaviors by date (newest first)
  const sortedBehaviors = [...behaviors].sort((a, b) => 
    new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
  );
  
  let currentStreak = 0;
  let longestStreak = 0;
  let lastBehaviorDate = sortedBehaviors[0].created_at;
  
  // Simple streak calculation - count consecutive days with positive behaviors
  // This is a simplified version - a real implementation would need to check dates
  const positiveBehaviors = sortedBehaviors.filter(b => b.points > 0);
  
  // For now, we'll calculate streak based on number of positive behaviors
  // In a real app, this would track consecutive days
  currentStreak = positiveBehaviors.length;
  longestStreak = positiveBehaviors.length;
  
  return {
    currentStreak,
    longestStreak,
    lastBehaviorDate,
    streakMilestones: {
      threeDay: currentStreak >= 3,
      weekly: currentStreak >= 7,
      monthly: currentStreak >= 30,
    },
  };
}

export function formatLeaderboardData(
  students: StudentWithPoints[],
  behaviors: BehaviorWithDetails[]
): LeaderboardEntry[] {
  const studentStats = students.map(student => {
    const studentBehaviors = behaviors.filter(b => b.student_id === student.id);
    const goodBehaviors = studentBehaviors.filter(b => b.points > 0).length;
    const badBehaviors = studentBehaviors.filter(b => b.points < 0).length;
    
    return {
      studentId: student.id,
      studentName: `${student.first_name} ${student.last_name}`,
      totalPoints: student.total_points || 0,
      goodBehaviors,
      badBehaviors,
    };
  });
  
  // Sort by total points (descending)
  const sortedStudents = studentStats.sort((a, b) => b.totalPoints - a.totalPoints);
  
  // Assign ranks
  return sortedStudents.map((student, index) => ({
    rank: index + 1,
    ...student,
    trend: "same", // Would calculate actual trend in real implementation
  }));
}

export function generateAchievementMessage(badgeName: string, studentName: string): string {
  return `${studentName} earned the "${badgeName}" badge! 🎉`;
}

export function calculateRankChanges(
  previousLeaderboard: LeaderboardEntry[],
  currentLeaderboard: LeaderboardEntry[]
): LeaderboardEntry[] {
  return currentLeaderboard.map(current => {
    const previous = previousLeaderboard.find(p => p.studentId === current.studentId);
    
    if (!previous) {
      return { ...current, trend: "up" };
    }
    
    if (previous.rank < current.rank) {
      return { ...current, trend: "down" };
    } else if (previous.rank > current.rank) {
      return { ...current, trend: "up" };
    } else {
      return { ...current, trend: "same" };
    }
  });
}

export function formatAchievementNotification(
  type: string,
  studentName: string,
  achievementName: string,
  points?: number
): string {
  switch (type) {
    case "badge_earned":
      return `${studentName} earned the "${achievementName}" badge! 🎉`;
    case "reward_redeemed":
      return `${studentName} redeemed "${achievementName}" for ${points} points! 🎁`;
    case "milestone_achieved":
      return `${studentName} reached the "${achievementName}" milestone! 🏆`;
    case "streak_broken":
      return `${studentName}'s streak was broken. Keep going! 🔥`;
    default:
      return `${studentName} achieved something great! 🌟`;
  }
}

export function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "🏅";
  }
}

export function formatPointsWithSign(points: number): string {
  return points > 0 ? `+${points}` : `${points}`;
}

export function getPointColor(points: number): string {
  return points > 0 ? "text-green-600" : "text-red-600";
}

export function formatDateForDisplay(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
}

export function formatDateForInput(dateString: string): string {
  return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
}