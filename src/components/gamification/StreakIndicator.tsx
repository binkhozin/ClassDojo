import React from "react";
import { Flame, Trophy } from "lucide-react";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface StreakIndicatorProps {
  currentStreak: number;
  longestStreak: number;
  showMilestones?: boolean;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  currentStreak,
  longestStreak,
  showMilestones = true,
}) => {
  const getStreakColor = () => {
    if (currentStreak >= 30) return "bg-orange-500 hover:bg-orange-600";
    if (currentStreak >= 7) return "bg-yellow-500 hover:bg-yellow-600";
    if (currentStreak >= 3) return "bg-blue-500 hover:bg-blue-600";
    return "bg-gray-500 hover:bg-gray-600";
  };

  const getStreakIcon = () => {
    if (currentStreak >= 30) return <Flame className="h-4 w-4 mr-1" />;
    if (currentStreak >= 7) return <Flame className="h-4 w-4 mr-1" />;
    if (currentStreak >= 3) return <Flame className="h-4 w-4 mr-1" />;
    return <Flame className="h-4 w-4 mr-1" />;
  };

  const getMilestoneText = () => {
    const milestones = [];
    if (currentStreak >= 30) milestones.push("🔥 30-day streak!");
    else if (currentStreak >= 7) milestones.push("🔥 7-day streak!");
    else if (currentStreak >= 3) milestones.push("🔥 3-day streak!");
    
    if (currentStreak === longestStreak && currentStreak > 0) {
      milestones.push(`🏆 Personal best!`);
    }
    
    return milestones.join(" ");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={getStreakColor() + " text-white cursor-pointer"}>
            {getStreakIcon()}
            {currentStreak} day streak
            {currentStreak === longestStreak && longestStreak > 0 && (
              <Trophy className="h-3 w-3 ml-1" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p>Current streak: {currentStreak} days</p>
            <p>Longest streak: {longestStreak} days</p>
            {showMilestones && currentStreak > 0 && (
              <p className="mt-1 text-green-600">{getMilestoneText()}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};