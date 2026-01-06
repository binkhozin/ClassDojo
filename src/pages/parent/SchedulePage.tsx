import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  MapPin,
  Bell,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  ExternalLink,
} from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// Mock schedule data
const mockSchedule = {
  "2024-01-15": [
    {
      id: "1",
      title: "Math Class",
      startTime: "09:00",
      endTime: "10:00",
      type: "class",
      teacher: "Mrs. Sarah Wilson",
      location: "Room 205",
      description: "Introduction to fractions",
      color: "#3B82F6"
    },
    {
      id: "2",
      title: "Science Lab",
      startTime: "11:00",
      endTime: "12:00",
      type: "class",
      teacher: "Mr. John Davis",
      location: "Science Lab",
      description: "Chemistry experiments",
      color: "#10B981"
    },
    {
      id: "3",
      title: "Parent-Teacher Conference",
      startTime: "14:00",
      endTime: "14:30",
      type: "meeting",
      teacher: "Mrs. Sarah Wilson",
      location: "Room 205",
      description: "Quarterly progress review",
      color: "#F59E0B"
    }
  ],
  "2024-01-16": [
    {
      id: "4",
      title: "English Literature",
      startTime: "09:00",
      endTime: "10:00",
      type: "class",
      teacher: "Ms. Emily Brown",
      location: "Room 203",
      description: "Reading comprehension activities",
      color: "#8B5CF6"
    },
    {
      id: "5",
      title: "Art Class",
      startTime: "13:00",
      endTime: "14:00",
      type: "class",
      teacher: "Mrs. Lisa Johnson",
      location: "Art Studio",
      description: "Watercolor painting techniques",
      color: "#EF4444"
    }
  ],
  "2024-01-17": [
    {
      id: "6",
      title: "Physical Education",
      startTime: "10:00",
      endTime: "11:00",
      type: "class",
      teacher: "Mr. Michael Smith",
      location: "Gymnasium",
      description: "Basketball fundamentals",
      color: "#06B6D4"
    },
    {
      id: "7",
      title: "Field Trip",
      startTime: "09:00",
      endTime: "15:00",
      type: "event",
      teacher: "Mrs. Sarah Wilson",
      location: "Science Museum",
      description: "Educational field trip to the local science museum",
      color: "#84CC16"
    }
  ]
};

const mockChildren = [
  {
    id: "student1",
    first_name: "Emma",
    last_name: "Johnson",
    class: { name: "5th Grade A" }
  },
  {
    id: "student2", 
    first_name: "Alex",
    last_name: "Chen",
    class: { name: "5th Grade A" }
  }
];

export default function ParentSchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"week" | "day">("week");

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getScheduleForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return mockSchedule[dateKey as keyof typeof mockSchedule] || [];
  };

  const getWeekEvents = () => {
    const events: any[] = [];
    weekDays.forEach(day => {
      const dayEvents = getScheduleForDate(day);
      events.push(...dayEvents);
    });
    return events;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const days = direction === "next" ? 7 : -7;
    setCurrentWeek(prev => addDays(prev, days));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "meeting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "event":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "class":
        return <BookOpen className="h-4 w-4" />;
      case "meeting":
        return <Users className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const todayEvents = getScheduleForDate(new Date());
  const weekEvents = getWeekEvents();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-600 mt-1">
            View your children's class schedules and upcoming events
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[200px] text-center">
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Children</option>
            {mockChildren.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Today's Schedule
            <span className="ml-2 text-sm font-normal text-gray-500">
              {format(new Date(), "EEEE, MMMM d")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayEvents.length > 0 ? (
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: event.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge className={getEventTypeColor(event.type)}>
                        {getEventTypeIcon(event.type)}
                        <span className="ml-1 capitalize">{event.type}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{event.teacher}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No classes scheduled for today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Week View */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayEvents = getScheduleForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card
              key={index}
              className={cn(
                "min-h-[300px]",
                isToday ? "border-blue-500 border-2" : ""
              )}
            >
              <CardHeader className={cn(
                "pb-3",
                isToday ? "bg-blue-50" : ""
              )}>
                <CardTitle className="text-sm font-medium text-center">
                  <div className="text-xs text-gray-500 uppercase">
                    {format(day, "EEE")}
                  </div>
                  <div className={cn(
                    "text-lg mt-1",
                    isToday ? "text-blue-600 font-bold" : ""
                  )}>
                    {format(day, "d")}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded text-xs border cursor-pointer hover:bg-gray-50"
                      style={{ borderLeftColor: event.color, borderLeftWidth: '3px' }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-gray-500">{event.startTime}</div>
                    </div>
                  ))}
                  {dayEvents.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-4">
                      No events
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Events</CardTitle>
          <CardDescription>
            All scheduled classes, meetings, and events for the current week
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weekEvents.length > 0 ? (
            <div className="space-y-3">
              {weekEvents
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: event.color }}
                    ></div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {weekDays.find(d => 
                              getScheduleForDate(d).some(e => e.id === event.id)
                            ) && format(
                              weekDays.find(d => 
                                getScheduleForDate(d).some(e => e.id === event.id)
                              )!,
                              "EEE, MMM d"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{event.teacher}</span>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getEventTypeColor(event.type)}>
                      {getEventTypeIcon(event.type)}
                      <span className="ml-1 capitalize">{event.type}</span>
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No events scheduled for this week</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}