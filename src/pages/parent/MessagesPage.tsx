import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useParentMessages, useConversations, useMarkAllMessagesAsRead } from "@/hooks/useParentMessages";
import { useUnreadAnnouncementsCount } from "@/hooks/useAnnouncements";
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
} from "lucide-react";
import { formatMessageTimeShort, truncateMessageContent, getMessageStatus } from "@/lib/messagingUtils";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filterType, setFilterType] = useState<"all" | "unread" | "archived">("all");
  const [sortBy, setSortBy] = useState<"date" | "unread" | "alphabetical">("date");

  const { data: conversations = [], isLoading } = useConversations();
  const { data: messagesData } = useParentMessages({ limit: 100 });
  const { data: unreadAnnouncements = 0 } = useUnreadAnnouncementsCount();
  const markAllAsRead = useMarkAllMessagesAsRead();

  // Filter and sort conversations
  const filteredConversations = React.useMemo(() => {
    let filtered = [...conversations];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((conversation) => {
        const lastMessage = conversation.lastMessage;
        return (
          lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (lastMessage?.subject && lastMessage.subject.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      });
    }

    // Apply type filter
    switch (filterType) {
      case "unread":
        filtered = filtered.filter((conv) => conv.unreadCount > 0);
        break;
      case "archived":
        filtered = filtered.filter((conv) => conv.archivedBy?.includes(user?.id || ""));
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "unread":
        filtered.sort((a, b) => b.unreadCount - a.unreadCount);
        break;
      case "alphabetical":
        filtered.sort((a, b) => {
          const aName = getConversationTitle(a, user?.id || "");
          const bName = getConversationTitle(b, user?.id || "");
          return aName.localeCompare(bName);
        });
        break;
    }

    return filtered;
  }, [conversations, searchQuery, filterType, sortBy, user?.id]);

  const getConversationTitle = (conversation: Conversation, currentUserId: string): string => {
    if (conversation.participantIds.length === 2) {
      const otherParticipantId = conversation.participantIds.find(id => id !== currentUserId);
      return otherParticipantId || "Unknown User";
    }
    if (conversation.relatedStudentId) {
      return "Student Discussion";
    }
    return "General Discussion";
  };

  const getConversationSubtitle = (conversation: Conversation): string => {
    const lastMessage = conversation.lastMessage;
    if (!lastMessage) return "No messages yet";
    
    const senderName = lastMessage.sender_id === user?.id ? "You" : lastMessage.sender?.full_name || "Unknown";
    return `${senderName}: ${truncateMessageContent(lastMessage.content, 60)}`;
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">
            Communicate with your children's teachers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              <MailOpen className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold">{conversations.length}</p>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Announcements</p>
                <p className="text-2xl font-bold">{unreadAnnouncements}</p>
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
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="unread">Sort by Unread</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
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
                {searchQuery ? "No messages found" : "No conversations yet"}
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "Start a conversation with your children's teachers"}
              </p>
              {!searchQuery && (
                <Button className="mt-4">
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
              onClick={() => navigate(`/parent/messages/${conversation.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {conversation.lastMessage?.sender_id === user?.id ? (
                          <User className="h-6 w-6" />
                        ) : (
                          conversation.lastMessage?.sender?.full_name
                            ?.split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase() || "T"
                        )}
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
                      <h3 className={cn(
                        "font-semibold truncate",
                        conversation.unreadCount > 0 ? "text-gray-900" : "text-gray-700"
                      )}>
                        {getConversationTitle(conversation, user?.id || "")}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatMessageTimeShort(conversation.updatedAt)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="bg-blue-600">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className={cn(
                      "text-sm truncate mt-1",
                      conversation.unreadCount > 0 ? "text-gray-700" : "text-gray-500"
                    )}>
                      {getConversationSubtitle(conversation)}
                    </p>
                    {conversation.relatedStudentId && (
                      <p className="text-xs text-blue-600 mt-1">
                        Regarding: Student Discussion
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            Showing {filteredConversations.length} of {conversations.length} conversations
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