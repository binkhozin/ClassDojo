import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  MessageCircle,
  Award,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus,
  Eye,
  Bell,
  Star,
  Activity,
} from "lucide-react";
import { useParentChildren } from "@/hooks/useParentChildren";
import { useParentMessages } from "@/hooks/useParentMessages";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalChildren: number;
  totalPoints: number;
  unreadMessages: number;
  recentActivities: number;
}

export default function ParentDashboardPage() {
  const { user } = useAuth();

  // Fetch data for dashboard
  const { data: children = [], isLoading: childrenLoading } = useParentChildren();
  const { data: unreadMessages = 0 } = useParentMessages({
    filters: { isRead: false },
  });
  const { data: announcements = [] } = useAnnouncements({ limit: 3 });

  // Calculate dashboard stats
  const stats: DashboardStats = {
    totalChildren: children.length,
    totalPoints: children.reduce((sum, child) => sum + (child.total_points || 0), 0),
    unreadMessages,
    recentActivities: announcements.length,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getChildProgressColor = (points: number, classAverage: number = 0) => {
    if (points > classAverage) return "text-green-600";
    if (points < classAverage * 0.8) return "text-red-600";
    return "text-yellow-600";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "behavior":
        return <Activity className="h-4 w-4 text-blue-500" />;
      case "reward":
        return <Award className="h-4 w-4 text-green-500" />;
      case "badge":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "message":
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityDescription = (item: any) => {
    const { type, data, student } = item;
    switch (type) {
      case "behavior":
        return (
          <span>
            <strong>{student?.first_name}</strong> earned {data.points} points for{" "}
            <em>{data.category_name}</em>
          </span>
        );
      case "reward":
        return (
          <span>
            <strong>{student?.first_name}</strong> earned reward: <em>{data.reward_name}</em>
          </span>
        );
      case "badge":
        return (
          <span>
            <strong>{student?.first_name}</strong> earned badge: <em>{data.badge_name}</em>
          </span>
        );
      case "message":
        return (
          <span>
            New message from <strong>{data.teacher_name}</strong> about{" "}
            <strong>{student?.first_name}</strong>
          </span>
        );
      default:
        return <span>Recent activity</span>;
    }
  };

  // Empty state when no children are linked
  if (!childrenLoading && children.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to ClassDojo, {user?.full_name?.split(" ")[0]}!
            </h1>
            <p className="text-lg text-gray-600">
              Connect with your children's teachers and track their progress
            </p>
          </div>

          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Connected</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                To get started, you'll need to link your children to your account. This connects you
                to their classes and teachers.
              </p>
              <div className="space-y-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
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
    <div className="p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            Here's what's happening with your children today
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChildren}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalChildren === 1 ? "child connected" : "children connected"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all children
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unreadMessages === 1 ? "message waiting" : "messages waiting"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">
              {announcements.length === 1 ? "new announcement" : "new announcements"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild variant="outline">
          <Link to="/parent/messages">
            <MessageCircle className="h-4 w-4 mr-2" />
            View Messages
            {stats.unreadMessages > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.unreadMessages}
              </Badge>
            )}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/parent/reports">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/parent/announcements">
            <Bell className="h-4 w-4 mr-2" />
            Announcements
          </Link>
        </Button>
      </div>

      {/* Children Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Children</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/parent/children">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={child.avatar_url} alt={child.first_name} />
                    <AvatarFallback>
                      {getInitials(`${child.first_name} ${child.last_name}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {child.first_name} {child.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <span>{child.class?.name || "No class"}</span>
                      {child.class?.teacher && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{child.class.teacher.full_name}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Points and Rank */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Points</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {child.total_points?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class Rank</p>
                    <p className="text-2xl font-bold">
                      #{child.current_rank || "--"}
                    </p>
                  </div>
                </div>

                {/* Recent Behavior Summary */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Recent Behavior</p>
                  <div className="space-y-2">
                    {child.recent_behaviors?.slice(0, 3).map((behavior) => (
                      <div key={behavior.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{behavior.category?.name}</span>
                        <Badge
                          variant={behavior.points > 0 ? "default" : "destructive"}
                          className="ml-2"
                        >
                          {behavior.points > 0 ? "+" : ""}
                          {behavior.points}
                        </Badge>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-400">No recent behaviors</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link to={`/parent/children/${child.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/parent/messages?student=${child.id}`}>
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activities Feed */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/parent/activity">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="space-y-1">
              {announcements.slice(0, 5).map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start space-x-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon("announcement")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {announcement.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant={announcement.priority === "high" ? "destructive" : "secondary"}>
                      {announcement.priority}
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}