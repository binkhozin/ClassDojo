import React, { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  ArrowLeft,
  Send,
  MoreHorizontal,
  Reply,
  Forward,
  Copy,
  Trash2,
  Smile,
  Paperclip,
  Phone,
  Video,
  User,
  Clock,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { useConversation, useSendMessage, useMarkMessageAsRead } from "@/hooks/useParentMessages";
import { formatMessageTimestamp, formatRelativeTime, getMessageStatus } from "@/lib/messagingUtils";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ConversationView() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messageContent, setMessageContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const studentId = searchParams.get("student");
  const { data: conversationData, isLoading } = useConversation(conversationId!);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessageAsRead();

  const { messages = [], participants = [] } = conversationData || {};

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when component loads
  useEffect(() => {
    if (messages.length > 0 && user?.id) {
      const unreadMessages = messages.filter(
        (msg) => msg.recipient_id === user.id && !msg.is_read
      );
      unreadMessages.forEach((msg) => {
        markAsRead.mutate({ messageId: msg.id, isRead: true });
      });
    }
  }, [messages, user?.id, markAsRead]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getParticipantName = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    return participant?.full_name || "Unknown User";
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !conversationId) return;

    try {
      // For now, send to the other participant (assuming this is a 1-on-1 conversation)
      const otherParticipant = participants.find((p) => p.id !== user?.id);
      if (!otherParticipant) {
        toast.error("No recipient found");
        return;
      }

      await sendMessage.mutateAsync({
        recipientId: otherParticipant.id,
        content: messageContent.trim(),
        relatedStudentId: studentId || undefined,
        messageType: "general",
      });

      setMessageContent("");
      textareaRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard");
  };

  const handleReply = (message: any) => {
    setMessageContent(`@${getParticipantName(message.sender_id)} ${messageContent}`);
    textareaRef.current?.focus();
  };

  const groupMessagesByDate = () => {
    const groups: Record<string, typeof messages> = {};
    
    messages.forEach((message) => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups);
  };

  const messageGroups = groupMessagesByDate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!conversationData || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <User className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversation found</h3>
        <p className="text-gray-600 mb-4">Start a new conversation with a teacher</p>
        <Button onClick={() => navigate("/parent/messages")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/parent/messages")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              {/* Teacher/Participant Info */}
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {participants.length > 0 ? (
                    getInitials(getParticipantName(participants[0].id))
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-lg">
                  {participants.length > 0
                    ? getParticipantName(participants[0].id)
                    : "Conversation"}
                </h2>
                <p className="text-sm text-gray-500">
                  {participants.length > 1 ? `${participants.length} participants` : "1-on-1 conversation"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Clock className="mr-2 h-4 w-4" />
                    View History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messageGroups.map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white px-3 py-1 rounded-full shadow-sm border">
                <span className="text-sm text-gray-600">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-3">
              {dayMessages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;
                const status = getMessageStatus(message, user?.id || "");
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      isOwnMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm",
                        isOwnMessage
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 border"
                      )}
                    >
                      {/* Sender info for received messages */}
                      {!isOwnMessage && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(getParticipantName(message.sender_id))}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-gray-600">
                            {getParticipantName(message.sender_id)}
                          </span>
                        </div>
                      )}

                      {/* Message content */}
                      <div className="break-words">
                        {message.subject && (
                          <p className="text-sm font-medium mb-1 opacity-75">
                            {message.subject}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>

                      {/* Message metadata */}
                      <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                        <span>{formatMessageTimestamp(message.created_at)}</span>
                        {isOwnMessage && (
                          <div className="flex items-center space-x-1">
                            {status.status === 'sent' && <Check className="h-3 w-3" />}
                            {status.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                            {status.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-300" />}
                          </div>
                        )}
                      </div>

                      {/* Message actions */}
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleReply(message)}>
                              <Reply className="mr-2 h-4 w-4" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyMessage(message.content)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Forward className="mr-2 h-4 w-4" />
                              Forward
                            </DropdownMenuItem>
                            {isOwnMessage && (
                              <DropdownMenuSeparator />
                            )}
                            {isOwnMessage && (
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 bg-gray-100 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            <span>
              {participants.length > 0 ? getParticipantName(participants[0].id) : "Someone"} is typing...
            </span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="min-h-[40px] max-h-32 resize-none"
                disabled={sendMessage.isPending}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendMessage.isPending}
                size="sm"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Character count and formatting */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
            <span className={cn(
              messageContent.length > 1900 ? "text-red-500" : ""
            )}>
              {messageContent.length}/2000
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}