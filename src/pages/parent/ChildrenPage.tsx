import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Plus,
  Eye,
  MessageCircle,
  Award,
  TrendingUp,
  Target,
  Star,
  Calendar,
  BookOpen,
  Trophy,
  Activity,
  MoreHorizontal,
  Settings,
  UserPlus,
} from "lucide-react";
import { useParentChildren } from "@/hooks/useParentChildren";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockChildren = [
  {
    id: "student1",
    first_name: "Emma",
    last_name: "Johnson",
    avatar_url: null,
    class: {
      name: "5th Grade A",
      color: "#3B82F6",
      teacher: {
        full_name: "Mrs. Sarah Wilson",
        email: "sarah.wilson@school.edu"
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
      }
    ],
    earned_rewards: [
      {
        id: "1",
        reward: { name: "Sticker Pack", icon: "⭐" },
        earned_at: new Date().toISOString()
      }
    ],
    earned_badges: [
      {
        id: "1",
        badge: { name: "Perfect Week", icon: "🏆", description: "No negative behaviors for a full week" },
        earned_at: new Date(Date.now() - 604800000).toISOString()
      }
    ]
  },
  {
    id: "student2",
    first_name: "Alex",
    last_name: "Chen",
    avatar_url: null,
    class: {
      name: "5th Grade A",
      color: "#3B82F6",
      teacher: {
        full_name: "Mrs. Sarah Wilson",
        email: "sarah.wilson@school.edu"
      }
    },
    total_points: 1923,
    current_rank: 12,
    recent_behaviors: [
      {
        id: "3",
        points: 3,
        category: { name: "Good Listening", type: "positive" },
        created_at: new Date(Date.now() - 3600000).toISOString(),
        note: "Followed instructions well"
      }
    ],
    earned_rewards: [],
    earned_badges: []
  }
];

export default function ParentChildrenPage() {
  const { data: children = [], isLoading } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  // Use mock data for demonstration
  const displayChildren = children.length > 0 ? children : mockChildren;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank <= 10) return <Award className="h-4 w-4 text-blue-500" />;
    return <Target className="h-4 w-4 text-gray-500" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return "bg-yellow-100 text-yellow-800";
    if (rank <= 10) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getPerformanceColor = (points: number, rank: number) => {
    if (rank <= 3) return "text-green-600";
    if (rank <= 10) return "text-blue-600";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no children are linked
  if (displayChildren.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Children</h1>
            <p className="text-lg text-gray-600">
              Manage your children's information and progress
            </p>
          </div>

          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Connected</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                To view and manage your children's information, you'll need to link them to your account.
              </p>
              <div className="space-y-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect Your First Child
                </Button>
                <div className="text-sm text-gray-500">
                  <p>Need help? Contact your child's teacher or school administrator.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
          <p className="text-gray-600 mt-1">
            Manage your children's information and track their progress
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Link Another Child
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Children</p>
                <p className="text-2xl font-bold">{displayChildren.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold">
                  {displayChildren.reduce((sum, child) => sum + (child.total_points || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Rank</p>
                <p className="text-2xl font-bold">
                  #{Math.min(...displayChildren.map(child => child.current_rank || 999))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Badges Earned</p>
                <p className="text-2xl font-bold">
                  {displayChildren.reduce((sum, child) => sum + (child.earned_badges?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayChildren.map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={child.avatar_url} alt={child.first_name} />
                    <AvatarFallback className="text-xl">
                      {getInitials(child.first_name, child.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {child.first_name} {child.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>{child.class.name}</span>
                      <span>•</span>
                      <span>{child.class.teacher.full_name}</span>
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/parent/children/${child.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/parent/messages?student=${child.id}`}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message Teacher
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Performance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <p className={cn(
                      "text-2xl font-bold",
                      getPerformanceColor(child.total_points || 0, child.current_rank || 999)
                    )}>
                      {child.total_points?.toLocaleString() || 0}
                    </p>
                    {getRankIcon(child.current_rank || 999)}
                  </div>
                  <p className="text-sm text-gray-600">Current Points</p>
                  <Badge className={cn("mt-1", getRankBadge(child.current_rank || 999))}>
                    Rank #{child.current_rank || "--"}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {child.earned_rewards?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Rewards Earned</p>
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <h4 className="font-medium mb-3">Recent Activities</h4>
                <div className="space-y-2">
                  {child.recent_behaviors?.slice(0, 3).map((behavior) => (
                    <div key={behavior.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          behavior.points > 0 ? "bg-green-500" : "bg-red-500"
                        )}></div>
                        <span className="truncate">{behavior.category.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={behavior.points > 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {behavior.points > 0 ? "+" : ""}{behavior.points}
                        </Badge>
                        <span className="text-gray-500 text-xs">
                          {formatDistanceToNow(new Date(behavior.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500 italic">No recent activities</p>
                  )}
                </div>
              </div>

              {/* Recent Achievements */}
              {(child.earned_rewards?.length || child.earned_badges?.length) ? (
                <div>
                  <h4 className="font-medium mb-3">Recent Achievements</h4>
                  <div className="flex flex-wrap gap-2">
                    {child.earned_rewards?.slice(0, 2).map((item) => (
                      <Badge key={item.id} variant="outline" className="text-xs">
                        ⭐ {item.reward.name}
                      </Badge>
                    ))}
                    {child.earned_badges?.slice(0, 2).map((item) => (
                      <Badge key={item.id} variant="outline" className="text-xs">
                        {item.badge.icon} {item.badge.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button asChild className="flex-1">
                  <Link to={`/parent/children/${child.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={`/parent/messages?student=${child.id}`}>
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for managing your children</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <MessageCircle className="h-6 w-6 mb-2" />
              <span>Message Teachers</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span>View Schedules</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <BookOpen className="h-6 w-6 mb-2" />
              <span>Progress Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}