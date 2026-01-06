import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { supabase } from "../integrations/supabase";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    };

    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications(prev => [payload.new, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast notification
            toast[payload.new.type === "badge_earned" ? "success" : "info"](
              payload.new.title,
              {
                description: payload.new.content,
              }
            );
          } else if (payload.eventType === "UPDATE") {
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? payload.new : n)
            );
            setUnreadCount(prev => 
              payload.new.is_read ? prev - 1 : prev
            );
          } else if (payload.eventType === "DELETE") {
            setNotifications(prev => 
              prev.filter(n => n.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    
    if (unreadNotifications.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadNotifications.map(n => n.id));

    if (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const clearAll = async () => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "behavior_alert":
        return "📝";
      case "reward_redeemed":
        return "🎁";
      case "badge_earned":
        return "🏅";
      case "milestone_achieved":
        return "🏆";
      case "streak_broken":
        return "🔥";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "badge_earned":
      case "milestone_achieved":
        return "bg-yellow-100 border-yellow-200";
      case "reward_redeemed":
        return "bg-green-100 border-green-200";
      case "behavior_alert":
        return "bg-blue-100 border-blue-200";
      case "streak_broken":
        return "bg-red-100 border-red-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 origin-top-right rounded-md shadow-lg z-50"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark all as read
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAll}
                    disabled={notifications.length === 0}
                  >
                    Clear all
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg border ${getNotificationColor(notification.type)} ${!notification.is_read ? "ring-1 ring-primary" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-xl mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              {!notification.is_read && (
                                <span className="h-2 w-2 rounded-full bg-primary ml-2" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 ml-2" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            {notification.is_read ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};