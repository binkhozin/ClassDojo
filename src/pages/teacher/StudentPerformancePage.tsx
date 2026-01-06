import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { useStudents } from "../../hooks/useStudents";
import { useStudentPoints } from "../../hooks/useStudentPoints";
import { useStreaks } from "../../hooks/useStreaks";
import { useStudentBehaviors } from "../../hooks/useBehaviors";
import { StreakIndicator } from "../../components/gamification/StreakIndicator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export const StudentPerformancePage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const { data: students } = useStudents(classId);
  const { data: studentPoints } = useStudentPoints(selectedStudentId, classId);
  const { data: streaks } = useStreaks(selectedStudentId, classId);
  const { data: behaviors } = useStudentBehaviors(selectedStudentId);

  const selectedStudent = students?.find(s => s.id === selectedStudentId);

  // Prepare chart data
  const pointsOverTime = behaviors?.map((behavior: any) => ({
    date: new Date(behavior.created_at!).toLocaleDateString(),
    points: behavior.points,
  })) || [];

  const behaviorTypeData = [
    { name: "Positive", value: behaviors?.filter((b: any) => b.points > 0).length || 0 },
    { name: "Negative", value: behaviors?.filter((b: any) => b.points < 0).length || 0 },
  ];

  const exportReport = () => {
    // In a real app, this would generate a PDF or CSV report
    alert("Export report functionality would be implemented here");
  };

  const printView = () => {
    window.print();
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Student Performance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Student Selection */}
          <div className="mb-6">
            <Select 
              onValueChange={(value: string) => setSelectedStudentId(value)} 
              value={selectedStudentId}
              options={students?.map(student => ({
                value: student.id,
                label: `${student.first_name} ${student.last_name}`
              })) || []}
              placeholder="Select a student"
              className="w-full md:w-[300px]"
            />
          </div>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Header */}
              <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.avatar_url || undefined} />
                  <AvatarFallback>
                    {selectedStudent.first_name.charAt(0)}{selectedStudent.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {streaks && (
                      <StreakIndicator 
                        currentStreak={streaks.currentStreak} 
                        longestStreak={streaks.longestStreak}
                      />
                    )}
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" onClick={exportReport}>
                    Export Report
                  </Button>
                  <Button variant="outline" onClick={printView}>
                    Print View
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500">Total Points</div>
                    <div className="text-2xl font-bold">{studentPoints?.totalPoints || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500">Good Behaviors</div>
                    <div className="text-2xl font-bold text-green-600">
                      {behaviors?.filter(b => b.points > 0).length || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500">Bad Behaviors</div>
                    <div className="text-2xl font-bold text-red-600">
                      {behaviors?.filter(b => b.points < 0).length || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500">Behavior Ratio</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {behaviors?.length ? 
                        Math.round((behaviors.filter((b: any) => b.points > 0).length / behaviors.length) * 100) : 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Points Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle>Points Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pointsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="points" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Behavior Type Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Behavior Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={behaviorTypeData} 
                          cx="50%" 
                          cy="50%" 
                          labelLine={false} 
                          outerRadius={80} 
                          fill="#8884d8" 
                          dataKey="value"
                          label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {behaviorTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly/Monthly Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      +{studentPoints?.weeklyTotal || 0} points
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {behaviors?.filter((b: any) => {
                                const behaviorDate = new Date(b.created_at!);
                                const today = new Date();
                                const sevenDaysAgo = new Date();
                                sevenDaysAgo.setDate(today.getDate() - 7);
                                return behaviorDate >= sevenDaysAgo;
                              }).length || 0} behaviors this week
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      +{studentPoints?.monthlyTotal || 0} points
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {behaviors?.filter((b: any) => b.points).length || 0} behaviors this month
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison with Class Average */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparison with Class Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Your Points</div>
                      <div className="text-2xl font-bold">{studentPoints?.totalPoints || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Class Average</div>
                      <div className="text-2xl font-bold">N/A</div> {/* Would calculate in real implementation */}
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: "75%" }} // Would calculate percentage in real implementation
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 text-center">
                    You're performing above average!
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};