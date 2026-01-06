import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bell,
  Search,
  Filter,
  Calendar,
  User,
  School,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Archive,
  Trash2,
  MoreHorizontal,
  Share,
  BookOpen,
  Users,
  MessageCircle,
} from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// Mock announcements data
const mockAnnouncements = [
  {
    id: "1",
    title: "Parent-Teacher Conferences Next Week",
    content: "Parent-teacher conferences will be held next week from Tuesday to Thursday. Please sign up for a time slot using the link provided in your email. The conferences will be held in individual classrooms and last 15 minutes each.",
    priority: "high",
    targetAudience: "parents",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    teacher: {
      full_name: "Mrs. Sarah Wilson",
      avatar_url: null,
    },
    class: {
      name: "5th Grade A",
      color: "#3B82F6",
    },
    isRead: false,
  },
  {
    id: "2",
    title: "Field Trip to Science Museum - Permission Slip Required",
    content: "We are excited to announce our upcoming field trip to the Science Museum on March 15th. The cost is $15 per student and includes transportation and lunch. Please return the signed permission slip by March 10th.",
    priority: "medium",
    targetAudience: "class",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    teacher: {
      full_name: "Mrs. Sarah Wilson",
      avatar_url: null,
    },
    class: {
      name: "5th Grade A",
      color: "#3B82F6",
    },
    isRead: true,
  },
  {
    id: "3",
    title: "Spring Break Homework Packet",
    content: "Attached you'll find the optional spring break homework packet. While it's not required, completing it will help your child stay sharp during the break. Have a wonderful and restful vacation!",
    priority: "low",
    targetAudience: "parents",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    dueDate: null,
    teacher: {
      full_name: "Mrs. Sarah Wilson",
      avatar_url: null,
    },
    class: {
      name: "5th Grade A",
      color: "#3B82F6",
    },
    isRead: true,
  },
  {
    id: "4",
    title: "Classroom Supplies Needed",
    content: "We are running low on several classroom supplies and would appreciate donations of: tissues, hand sanitizer, dry erase markers, and construction paper. Thank you for your continued support!",
    priority: "medium",
    targetAudience: "parents",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    dueDate: null,
    teacher: {
      full_name: "Mrs. Sarah Wilson",
      avatar_url: null,
    },
    class: {
      name: "5th Grade A",
      color: "#3B82F6",
    },
    isRead: true,
  },
];

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "high":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "medium":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "low":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getAudienceIcon = (audience: string) => {
  switch (audience) {
    case "class":
      return <Users className="h-4 w-4" />;
    case "parents":
      return <User className="h-4 w-4" />;
    case "specific":
      return <MessageCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export default function ParentAnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAudience, setFilterAudience] = useState<string>("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter announcements
  const filteredAnnouncements = React.useMemo(() => {
    let filtered = [...mockAnnouncements];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((announcement) =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter((announcement) => announcement.priority === filterPriority);
    }

    // Apply audience filter
    if (filterAudience !== "all") {
      filtered = filtered.filter((announcement) => announcement.targetAudience === filterAudience);
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (b.priority === "high" && a.priority !== "high") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [searchQuery, filterPriority, filterAudience]);

  const unreadCount = mockAnnouncements.filter(ann => !ann.isRead).length;
  const highPriorityCount = mockAnnouncements.filter(ann => ann.priority === "high").length;

  const handleViewDetails = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setIsDetailOpen(true);
    
    // Mark as read (in real app, this would update the database)
    if (!announcement.isRead) {
      announcement.isRead = true;
    }
  };

  const handleMarkAsRead = (announcementId: string) => {
    // In real app, this would update the database
    const announcement = mockAnnouncements.find(ann => ann.id === announcementId);
    if (announcement) {
      announcement.isRead = true;
    }
  };

  const handleArchive = (announcementId: string) => {
    // In real app, this would update the database
    console.log("Archive announcement:", announcementId);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with important news from your children's classes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Announcements</p>
                <p className="text-2xl font-bold">{mockAnnouncements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">{highPriorityCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold">
                  {mockAnnouncements.filter(ann => 
                    ann.dueDate && new Date(ann.dueDate) > new Date() && 
                    new Date(ann.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAudience} onValueChange={setFilterAudience}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                  <SelectItem value="specific">Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? "No announcements found" : "No announcements yet"}
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "You'll see announcements from your children's teachers here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className={cn(
                "hover:shadow-md transition-shadow cursor-pointer",
                !announcement.isRead ? "border-blue-200 bg-blue-50/30" : ""
              )}
              onClick={() => handleViewDetails(announcement)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={cn(
                        "text-lg font-semibold",
                        !announcement.isRead ? "text-gray-900" : "text-gray-700"
                      )}>
                        {announcement.title}
                      </h3>
                      {!announcement.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        {getAudienceIcon(announcement.targetAudience)}
                        <span className="capitalize">{announcement.targetAudience}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: announcement.class.color }}
                        ></div>
                        <span>{announcement.class.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{announcement.teacher.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {announcement.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {getPriorityIcon(announcement.priority)}
                          <span className="ml-1 capitalize">{announcement.priority}</span>
                        </Badge>
                        
                        {announcement.dueDate && (
                          <div className="flex items-center space-x-1 text-sm text-orange-600">
                            <Calendar className="h-4 w-4" />
                            <span>Due {formatDistanceToNow(new Date(announcement.dueDate), { addSuffix: true })}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(announcement.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(announcement)}>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMarkAsRead(announcement.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Read
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchive(announcement.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Announcement Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedAnnouncement && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedAnnouncement.title}</DialogTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{selectedAnnouncement.teacher.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: selectedAnnouncement.class.color }}
                        ></div>
                        <span>{selectedAnnouncement.class.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(selectedAnnouncement.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(selectedAnnouncement.priority)}>
                    {getPriorityIcon(selectedAnnouncement.priority)}
                    <span className="ml-1 capitalize">{selectedAnnouncement.priority}</span>
                  </Badge>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                </div>
                
                {selectedAnnouncement.dueDate && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-800">
                        Action Required
                      </span>
                    </div>
                    <p className="text-orange-700 mt-1">
                      This announcement has a due date of {new Date(selectedAnnouncement.dueDate).toLocaleDateString()}.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Close
                  </Button>
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Reply to Teacher
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}