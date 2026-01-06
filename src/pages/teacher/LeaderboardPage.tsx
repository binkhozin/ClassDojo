import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import { useStudents } from "../../hooks/useStudents";
import { getMedalEmoji } from "../../lib/gamificationUtils";
import { motion } from "framer-motion";

export const LeaderboardPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [timePeriod, setTimePeriod] = useState<"today" | "week" | "month" | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const { data: leaderboard, isLoading } = useLeaderboard(classId, timePeriod);
  const { data: students } = useStudents(classId);

  const filteredLeaderboard = leaderboard?.filter(entry => 
    entry.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    if (!filteredLeaderboard) return;

    const csvHeader = [
      "Rank",
      "Student", 
      "Total Points",
      "Good Behaviors",
      "Bad Behaviors",
      "Trend"
    ];

    const csvRows = filteredLeaderboard.map(entry => [
      entry.rank,
      entry.studentName,
      entry.totalPoints,
      entry.goodBehaviors,
      entry.badBehaviors,
      entry.trend
    ]);

    const csvContent = [csvHeader, ...csvRows]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leaderboard-${timePeriod}-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading leaderboard...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Class Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Select 
              onValueChange={(value: any) => setTimePeriod(value)} 
              value={timePeriod}
              options={[
                { value: "today", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "all", label: "All Time" }
              ]}
              placeholder="Select time period"
            />

            <Input 
              placeholder="Search students..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Button onClick={exportToCSV} className="md:col-start-3">
              Export CSV
            </Button>
          </div>

          {/* Leaderboard Table */}
          {filteredLeaderboard && filteredLeaderboard.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Total Points</TableHead>
                    <TableHead className="text-right">Good</TableHead>
                    <TableHead className="text-right">Bad</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaderboard.map((entry) => (
                    <motion.tr
                      key={entry.studentId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {entry.rank <= 3 ? (
                            <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
                          ) : (
                            <span className="text-gray-500">{entry.rank}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={students?.find(s => s.id === entry.studentId)?.avatar_url || undefined}
                            />
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
                      <TableCell className="text-right">
                        <span className={getTrendColor(entry.trend)}>
                          {getTrendIcon(entry.trend)}
                        </span>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No students found in the leaderboard.
            </div>
          )}

          {/* Stats Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Students</div>
                <div className="text-2xl font-bold">{filteredLeaderboard?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Points (Class)</div>
                <div className="text-2xl font-bold">
                  {filteredLeaderboard?.reduce((sum, entry) => sum + entry.totalPoints, 0) || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Avg Points per Student</div>
                <div className="text-2xl font-bold">
                  {filteredLeaderboard?.length ? 
                    Math.round(filteredLeaderboard.reduce((sum, entry) => sum + entry.totalPoints, 0) / filteredLeaderboard.length) : 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};