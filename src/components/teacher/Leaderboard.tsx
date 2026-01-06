import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { getMedalEmoji } from "../../lib/gamificationUtils";
import type { LeaderboardEntry } from "../../types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  showMedals?: boolean;
  showTrend?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  title = "Class Leaderboard",
  showMedals = true,
  showTrend = true,
}) => {
  const getTrendIcon = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up":
        return "↑";
      case "down":
        return "↓";
      case "same":
      default:
        return "→";
    }
  };

  const getTrendColor = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "same":
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Total Points</TableHead>
                <TableHead className="text-right">Good</TableHead>
                <TableHead className="text-right">Bad</TableHead>
                {showTrend && <TableHead className="text-right">Trend</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.studentId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {showMedals && entry.rank <= 3 ? (
                        <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
                      ) : (
                        <span className="text-gray-500">{entry.rank}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={undefined} />
                        <AvatarFallback>
                          {entry.studentName.split(" ")[0].charAt(0)}
                          {entry.studentName.split(" ")[1]?.charAt(0) || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{entry.studentName}</div>
                        <div className="text-sm text-gray-500">
                          {Math.round((entry.goodBehaviors / (entry.goodBehaviors + entry.badBehaviors || 1)) * 100)}% positive
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    <Badge variant="secondary">
                      {entry.totalPoints} pts
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      +{entry.goodBehaviors}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      -{entry.badBehaviors}
                    </Badge>
                  </TableCell>
                  {showTrend && (
                    <TableCell className="text-right">
                      <span className={getTrendColor(entry.trend)}>
                        {getTrendIcon(entry.trend)}
                      </span>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};