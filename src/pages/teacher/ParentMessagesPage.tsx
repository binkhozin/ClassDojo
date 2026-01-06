import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  MessageCircle,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Clock,
  User,
  Users,
  Send,
  Paperclip,
  Smile,
  Star,
  GraduationCap,
  Phone,
  Video,
} from "lucide-react";
import { formatMessageTimeShort, truncateMessageContent } from "@/lib/messagingUtils";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useTeacherParentMessages } from "@/hooks/useTeacherParentMessages";
import { toast } from "sonner";

// Mock data for demonstration
const mockConversations = [
  {
    id: "1",
    parentId: "parent1",
    parent: {
      id: "parent1",
      full_name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      avatar_url: null,
      phone: "(555) 123-4567",
    },
    student: {
      id: "student1",
      first_name: "Emma",
      last_name: "Johnson",
      class: { name: "5th Grade A" }
    },
    lastMessage: {
      content: "Thank you so much for the update on Emma's progress. We're so proud of her!",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      sender_id: "parent1"
    },
    unreadCount: 2,
    messageType: "general",
    priority: "normal",
  },
  {
    id: "2",
    parentId: "parent2",
    parent: {
      id: "parent2",
      full_name: "Michael Chen",
      email: "michael.chen@email.com",
      avatar_url: null,
      phone: "(555) 987-6543",
    },
    student: {
      id: "student2",
      first_name: "Alex",
      last_name: "Chen",
      class: { name: "5th Grade A" }
    },
    lastMessage: {
      content: "Could we schedule a meeting to discuss Alex's behavior?",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      sender_id: "parent2"
    },
    unreadCount: 1,
    messageType: "behavior_report",
    priority: "high",
  },
  {
    id: "3",
    parentId: "parent3",
    parent: {
      id: "parent3",
      full_name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      avatar_url: null,
      phone: "(555) 456-7890",
    },
    student: {
      id: "student3",
      first_name: "Sofia",
      last_name: "Rodriguez",
      class: { name: "5th Grade A" }
    },
    lastMessage: {
      content: "Great job on the parent-teacher conference! Sofia is doing wonderfully.",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      sender_id: "teacher"
    },
    unreadCount: 0,
    messageType: "general",
    priority: "normal",
  },
];

const MESSAGE_TEMPLATES = [
  {
    id: "general",
    name: "General Message",
    description: "A general message to parents",
    subject: "",
    content: "Dear {{parentName}},\n\nI hope this message finds you well. I wanted to reach out regarding {{studentName}}'s progress in class.\n\n{{customContent}}\n\nPlease let me know if you have any questions or concerns.\n\nBest regards,\n{{teacherName}}"
  },
  {
    id: "behavior_report",
    name: "Behavior Report",
    description: "Report on student behavior",
    subject: "Behavior Report - {{studentName}}",
    content: "Dear {{parentName}},\n\nI wanted to share a behavior report for {{studentName}} from recent days.\n\n**Behavior Details:**\n{{behaviorDetails}}\n\n**Class Context:**\n{{classContext}}\n\nPlease let me know if you have any questions.\n\nBest regards,\n{{teacherName}}"
  },
  {
    id: "progress_report",
    name: "Progress Report",
    description: "Academic or social progress update",
    subject: "Progress Update - {{studentName}}",
    content: "Dear {{parentName}},\n\nPlease find a progress update for {{studentName}}.\n\n**Recent Achievements:**\n{{achievements}}\n\n**Areas for Growth:**\n{{growthAreas}}\n\n**Next Steps:**\n{{nextSteps}}\n\nThank you for your continued support.\n\nBest regards,\n{{teacherName}}"
  },
  {
    id: "behavioral_concern",
    name: "Behavioral Concern",
    description: "Address behavioral concerns",
    subject: "Behavioral Concern - {{studentName}}",
    content: "Dear {{parentName}},\n\nI would like to discuss a behavioral concern regarding {{studentName}}.\n\n**Concern Details:**\n{{concernDetails}}\n\n**Suggested Support:**\n{{supportSuggestions}}\n\nI would appreciate the opportunity to discuss this further.\n\nBest regards,\n{{teacherName}}"
  },
  {
    id: "positive_feedback",
    name: "Positive Feedback",
    description: "Share positive achievements",
    subject: "Great News About {{studentName}}!",
    content: "Dear {{parentName}},\n\nI wanted to share some wonderful news about {{studentName}}!\n\n**Highlights:**\n{{highlights}}\n\n{{studentName}} has been making excellent progress and it's been a joy to have them in class.\n\nKeep up the great work!\n\nBest regards,\n{{teacherName}}"
  },
  {
    id: "event_announcement",
    name: "Event Announcement",
    description: "Announce upcoming events",
    subject: "Upcoming Event - {{eventName}}",
    content: "Dear Parents,\n\nI wanted to inform you about an upcoming event:\n\n**Event:** {{eventName}}\n**Date:** {{eventDate}}\n**Time:** {{eventTime}}\n**Location:** {{eventLocation}}\n\n**Details:**\n{{eventDetails}}\n\nPlease let me know if you have any questions.\n\nBest regards,\n{{teacherName}}"
  }
];

export default function ParentMessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "high_priority">("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Filter conversations based on search and filters
  const filteredConversations = React.useMemo(() => {
    let filtered = [...mockConversations];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((conv) =>
        conv.parent.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case "unread":
        filtered = filtered.filter((conv) => conv.unreadCount > 0);
        break;
      case "high_priority":
        filtered = filtered.filter((conv) => conv.priority === "high");
        break;
    }

    // Apply class filter
    if (selectedClass !== "all") {
      filtered = filtered.filter((conv) => conv.student.class.name === selectedClass);
    }

    return filtered;
  }, [searchQuery, filterType, selectedClass]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "behavior_report":
        return <Users className="h-4 w-4" />;
      case "progress_report":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const unreadCount = filteredConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (conversationId) {
    // This would be handled by the conversation view component
    return null;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Messages</h1>
          <p className="text-gray-600 mt-1">
            Communicate with parents about their children
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm">
              <MailOpen className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose New Message</DialogTitle>
                <DialogDescription>
                  Send a message to parents or create an announcement
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Message Template</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-500">{template.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Recipients</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-parents">All Parents (5th Grade A)</SelectItem>
                        <SelectItem value="specific-parents">Specific Parents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="Message subject" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="w-full min-h-[200px] p-3 border rounded-md resize-none"
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                    Cancel
                  </Button>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Parents</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Mail className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">
                  {filteredConversations.filter(conv => conv.priority === "high").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">2.3h</p>
                <p className="text-xs text-gray-500">Average</p>
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
                placeholder="Search parents, students, or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="5th Grade A">5th Grade A</SelectItem>
                  <SelectItem value="5th Grade B">5th Grade B</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="high_priority">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      <div className="space-y-2">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "Start communicating with parents about their children's progress"}
              </p>
              {!searchQuery && (
                <Button className="mt-4" onClick={() => setIsComposeOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Send First Message
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={cn(
                "hover:shadow-md transition-shadow cursor-pointer",
                conversation.unreadCount > 0 ? "border-blue-200 bg-blue-50/30" : ""
              )}
              onClick={() => navigate(`/teacher/messages/${conversation.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Parent Avatar */}
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.parent.avatar_url} alt={conversation.parent.full_name} />
                      <AvatarFallback>
                        {getInitials(conversation.parent.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className={cn(
                          "font-semibold",
                          conversation.unreadCount > 0 ? "text-gray-900" : "text-gray-700"
                        )}>
                          {conversation.parent.full_name}
                        </h3>
                        {conversation.priority === "high" && (
                          <Badge className={getPriorityColor(conversation.priority)}>
                            <Star className="h-3 w-3 mr-1" />
                            High
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatMessageTimeShort(conversation.lastMessage.created_at)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="bg-blue-600">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-blue-600 font-medium">
                        {conversation.student.first_name} {conversation.student.last_name}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {conversation.student.class.name}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <div className="flex items-center space-x-1">
                        {getMessageTypeIcon(conversation.messageType)}
                        <span className="text-sm text-gray-500 capitalize">
                          {conversation.messageType.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    
                    <p className={cn(
                      "text-sm truncate mt-1",
                      conversation.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-500"
                    )}>
                      {conversation.lastMessage.sender_id === user?.id ? "You: " : ""}
                      {truncateMessageContent(conversation.lastMessage.content, 80)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          View Parent Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <GraduationCap className="mr-2 h-4 w-4" />
                          View Student Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredConversations.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredConversations.length} of {mockConversations.length} conversations
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}