import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  MessageCircle,
  Star,
  Trophy,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  User,
  BookOpen,
  Heart,
  Zap,
} from "lucide-react";
import { useChildProgress } from "@/hooks/useParentChildren";
import { useParentMessages } from "@/hooks/useParentMessages";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function StudentDetailsPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter" | "year">("month");

  const { data: progress, isLoading } = useChildProgress(studentId!, selectedPeriod);
  const { data: messagesData } = useParentMessages({
    filters: { studentId: studentId },
    limit: 10,
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getPerformanceColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getPerformanceIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank <= 10) return <Award className="h-4 w-4 text-blue-500" />;
    return <Target className="h-4 w-4 text-gray-500" />;
  };

  // Mock data for demonstration - in real app this would come from the API
  const mockStudent = {
    id: studentId,
    first_name: "Emma",
    last_name: "Johnson",
    avatar_url: null,
    class: {
      name: "5th Grade A",
      teacher: {
        full_name: "Mrs. Sarah Wilson",
        email: "sarah.wilson@school.edu",
        phone: "(555) 123-4567"
      }
    },
    total_points: 2847,
    current_rank: 3,
    recent_behaviors: [
      {
        id: "1",
        points: 5,
        category: { name: "Helping Others", type: "positive" },
        created_at: new Date().toISOString(),
        note: "Helped a classmate with math homework"
      },
      {
        id: "2", 
        points: -2,
        category: { name: "Talking Out", type: "negative" },
        created_at: new Date(Date.now() - 86400000).toISOString(),
        note: "Spoke without permission"
      },
      {
        id: "3",
        points: 5,
        category: { name: "Good Listening", type: "positive" },
        created_at: new Date(Date.now() - 172800000).toISOString(),
        note: "Followed directions first time"
      }
    ],
    earned_rewards: [
      {
        id: "1",
        reward: { name: "Sticker Pack", description: "Choose any 5 stickers" },
        earned_at: new Date().toISOString()
      },
      {
        id: "2",
        reward: { name: "Extra Computer Time", description: "30 minutes of free computer time" },
        earned_at: new Date(Date.now() - 604800000).toISOString()
      }
    ],
    earned_badges: [
      {
        id: "1",
        badge: { 
          name: "Perfect Week", 
          description: "No negative behaviors for a full week",
          icon: "🏆"
        },
        earned_at: new Date().toISOString()
      },
      {
        id: "2",
        badge: {
          name: "Helpful Friend",
          description: "Helped 10 classmates this month",
          icon: "🤝"
        },
        earned_at: new Date(Date.now() - 1209600000).toISOString()
      }
    ]
  };

  const behaviorDistribution = [
    { name: "Helping Others", value: 25, color: "#10B981" },
    { name: "Good Listening", value: 20, color: "#3B82F6" },
    { name: "Participation", value: 15, color: "#F59E0B" },
    { name: "Talking Out", value: -8, color: "#EF4444" },
    { name: "Off Task", value: -5, color: "#DC2626" }
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/parent/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mockStudent.first_name} {mockStudent.last_name}
            </h1>
            <p className="text-gray-600">{mockStudent.class.name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/parent/messages?student=${studentId}`}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message Teacher
            </Link>
          </Button>
        </div>
      </div>

      {/* Student Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={mockStudent.avatar_url} alt={mockStudent.first_name} />
              <AvatarFallback className="text-xl">
                {getInitials(mockStudent.first_name, mockStudent.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Current Points</p>
                  <p className="text-3xl font-bold text-blue-600">{mockStudent.total_points.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class Rank</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-3xl font-bold">#{mockStudent.current_rank}</p>
                    {getRankIcon(mockStudent.current_rank)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teacher</p>
                  <p className="text-lg font-semibold">{mockStudent.class.teacher.full_name}</p>
                  <p className="text-sm text-gray-500">{mockStudent.class.teacher.email}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="behaviors">Behaviors</TabsTrigger>
          <TabsTrigger value="rewards">Rewards & Badges</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Streaks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">7 days</p>
                <p className="text-sm text-gray-500">Positive behaviors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Longest Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">14 days</p>
                <p className="text-sm text-gray-500">This semester</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">+47</p>
                <p className="text-sm text-gray-500">Points earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Latest rewards and badges earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...mockStudent.earned_rewards.slice(0, 2), ...mockStudent.earned_badges.slice(0, 2)].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {'badge' in item ? (
                        <span className="text-2xl">{item.badge.icon}</span>
                      ) : (
                        <Award className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {'badge' in item ? item.badge.name : item.reward.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {'badge' in item ? item.badge.description : item.reward.description}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(item.earned_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Time Period:</span>
            <div className="flex space-x-2">
              {["week", "month", "quarter", "year"].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period as any)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Points Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progress?.snapshots || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="points" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Behavior Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={behaviorDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {behaviorDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{progress?.goodBehaviors || 0}</p>
                    <p className="text-sm text-gray-600">Good Behaviors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{progress?.badBehaviors || 0}</p>
                    <p className="text-sm text-gray-600">Behaviors to Work On</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Target className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">#{progress?.currentRank || "--"}</p>
                    <p className="text-sm text-gray-600">Current Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{progress?.classAverage || 0}</p>
                    <p className="text-sm text-gray-600">Class Average</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behaviors Tab */}
        <TabsContent value="behaviors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Timeline</CardTitle>
              <CardDescription>Recent behaviors and point changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStudent.recent_behaviors.map((behavior) => (
                  <div key={behavior.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={cn(
                      "p-2 rounded-full",
                      behavior.points > 0 ? "bg-green-100" : "bg-red-100"
                    )}>
                      {behavior.points > 0 ? (
                        <Heart className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{behavior.category.name}</p>
                        <Badge variant={behavior.points > 0 ? "default" : "destructive"}>
                          {behavior.points > 0 ? "+" : ""}{behavior.points} pts
                        </Badge>
                      </div>
                      {behavior.note && (
                        <p className="text-sm text-gray-600 mt-1">{behavior.note}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(behavior.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards & Badges Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rewards */}
            <Card>
              <CardHeader>
                <CardTitle>Earned Rewards</CardTitle>
                <CardDescription>Rewards your child has earned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStudent.earned_rewards.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                      <Award className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.reward.name}</p>
                        <p className="text-sm text-gray-600">{item.reward.description}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.earned_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Earned Badges</CardTitle>
                <CardDescription>Achievements and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStudent.earned_badges.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                      <span className="text-2xl">{item.badge.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{item.badge.name}</p>
                        <p className="text-sm text-gray-600">{item.badge.description}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.earned_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Badges to Work Towards */}
          <Card>
            <CardHeader>
              <CardTitle>Next Badges to Work Towards</CardTitle>
              <CardDescription>Achievements within reach</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <span className="font-semibold">Math Whiz</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Complete 20 math problems correctly</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">12/20 completed</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                    <span className="font-semibold">Bookworm</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Read 5 books this month</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">4/5 completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Communication with {mockStudent.class.teacher.full_name}</CardDescription>
            </CardHeader>
            <CardContent>
              {messagesData?.data && messagesData.data.length > 0 ? (
                <div className="space-y-4">
                  {messagesData.data.slice(0, 5).map((message) => (
                    <div key={message.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{message.sender?.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-gray-700 mt-1">{message.content}</p>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/parent/messages?student=${studentId}`}>
                      View All Messages
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No messages about this student yet</p>
                  <Button asChild>
                    <Link to={`/parent/messages?student=${studentId}`}>
                      Send First Message
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}