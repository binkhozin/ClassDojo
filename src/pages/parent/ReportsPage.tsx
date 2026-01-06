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
  FileText,
  Download,
  Share,
  Eye,
  Calendar,
  TrendingUp,
  Award,
  Activity,
  Filter,
  Search,
  Star,
  Clock,
  Users,
  BarChart3,
  PieChart,
  Target,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { useParentChildren } from "@/hooks/useParentChildren";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// Mock progress reports data
const mockReports = [
  {
    id: "1",
    studentId: "student1",
    student: {
      first_name: "Emma",
      last_name: "Johnson",
      class: { name: "5th Grade A" }
    },
    period: "weekly",
    title: "Weekly Progress Report - Emma Johnson",
    summary: "Emma has shown excellent improvement in her behavior this week. She earned 47 points through positive behaviors and only had 2 minor incidents.",
    totalPoints: 2847,
    goodBehaviors: 15,
    badBehaviors: 3,
    rank: 3,
    teacherNotes: "Emma has been particularly helpful this week, helping classmates and following instructions well. Keep up the great work!",
    recommendations: "Continue encouraging Emma's leadership qualities. Consider assigning her classroom helper roles.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    teacher: {
      full_name: "Mrs. Sarah Wilson"
    },
    sections: [
      {
        title: "Behavior Summary",
        content: "Emma demonstrated excellent behavior with 15 positive behaviors and only 3 behaviors that need improvement.",
        type: "behavior_summary"
      },
      {
        title: "Academic Progress",
        content: "Emma has been participating actively in class discussions and showing strong comprehension of math concepts.",
        type: "academic_progress"
      },
      {
        title: "Social Development",
        content: "Emma has been a positive influence on her peers and has shown excellent teamwork skills.",
        type: "social_emotional"
      }
    ]
  },
  {
    id: "2",
    studentId: "student1",
    student: {
      first_name: "Emma",
      last_name: "Johnson",
      class: { name: "5th Grade A" }
    },
    period: "monthly",
    title: "Monthly Progress Report - Emma Johnson",
    summary: "Emma had an outstanding month with significant improvements across all areas. She earned 3 new badges and maintained her top 5 position in class.",
    totalPoints: 2800,
    goodBehaviors: 58,
    badBehaviors: 8,
    rank: 4,
    teacherNotes: "Emma has been a pleasure to have in class. Her positive attitude and work ethic continue to inspire others.",
    recommendations: "Consider Emma for student council or other leadership opportunities. Her growth mindset makes her an excellent role model.",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    teacher: {
      full_name: "Mrs. Sarah Wilson"
    },
    sections: [
      {
        title: "Behavior Summary",
        content: "Emma showed remarkable improvement with 58 positive behaviors this month.",
        type: "behavior_summary"
      },
      {
        title: "Achievements",
        content: "Earned badges: Perfect Week, Helpful Friend, and Math Whiz.",
        type: "engagement"
      }
    ]
  },
  {
    id: "3",
    studentId: "student2",
    student: {
      first_name: "Alex",
      last_name: "Chen",
      class: { name: "5th Grade A" }
    },
    period: "weekly",
    title: "Weekly Progress Report - Alex Chen",
    summary: "Alex has been working on improving his focus and attention in class. While he still has some challenges, there have been positive developments.",
    totalPoints: 1923,
    goodBehaviors: 8,
    badBehaviors: 12,
    rank: 12,
    teacherNotes: "Alex needs continued support with staying on task. He responds well to positive reinforcement and one-on-one guidance.",
    recommendations: "Consider additional support for Alex with focus and attention strategies. Regular breaks and movement might help.",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    teacher: {
      full_name: "Mrs. Sarah Wilson"
    },
    sections: [
      {
        title: "Behavior Summary",
        content: "Alex had 8 positive behaviors but also 12 behaviors that need improvement, primarily related to staying focused.",
        type: "behavior_summary"
      },
      {
        title: "Areas for Growth",
        content: "Working on listening skills and staying on task during independent work time.",
        type: "engagement"
      }
    ]
  }
];

const PERIOD_LABELS = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly"
};

export default function ParentReportsPage() {
  const { data: children = [] } = useParentChildren();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter reports
  const filteredReports = React.useMemo(() => {
    let filtered = [...mockReports];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((report) =>
        report.student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply period filter
    if (selectedPeriod !== "all") {
      filtered = filtered.filter((report) => report.period === selectedPeriod);
    }

    // Apply student filter
    if (selectedStudent !== "all") {
      filtered = filtered.filter((report) => report.studentId === selectedStudent);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  }, [searchQuery, selectedPeriod, selectedStudent]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getPerformanceColor = (goodBehaviors: number, badBehaviors: number) => {
    const ratio = goodBehaviors / (goodBehaviors + badBehaviors);
    if (ratio >= 0.8) return "text-green-600";
    if (ratio >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleDownloadReport = (report: any) => {
    // In real app, this would download the actual PDF
    console.log("Downloading report:", report.id);
  };

  const handleShareReport = (report: any) => {
    // In real app, this would open share options
    console.log("Sharing report:", report.id);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Reports</h1>
          <p className="text-gray-600 mt-1">
            Track your children's academic and behavioral progress
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold">{mockReports.length}</p>
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
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">
                  {mockReports.filter(r => new Date(r.createdAt) > new Date(Date.now() - 30 * 86400000)).length}
                </p>
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
                <p className="text-sm text-gray-600">High Performers</p>
                <p className="text-2xl font-bold">
                  {mockReports.filter(r => r.rank <= 5).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Improvements</p>
                <p className="text-2xl font-bold">
                  {mockReports.filter(r => r.goodBehaviors > r.badBehaviors * 2).length}
                </p>
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
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.first_name} {child.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? "No reports found" : "No reports available"}
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "Progress reports will appear here once your children's teachers create them"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {getInitials(report.student.first_name, report.student.last_name)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.student.first_name} {report.student.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {report.student.class.name} • {PERIOD_LABELS[report.period as keyof typeof PERIOD_LABELS]} Report
                        </p>
                      </div>
                    </div>

                    <h4 className="text-xl font-medium text-gray-900 mb-2">
                      {report.title}
                    </h4>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {report.summary}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {report.totalPoints.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Total Points</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {report.goodBehaviors}
                        </p>
                        <p className="text-sm text-gray-600">Good Behaviors</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                          {report.badBehaviors}
                        </p>
                        <p className="text-sm text-gray-600">Behaviors to Work On</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">
                          #{report.rank}
                        </p>
                        <p className="text-sm text-gray-600">Class Rank</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{report.teacher.full_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownloadReport(report)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareReport(report)}>
                          <Share className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message Teacher
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

      {/* Report Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedReport.title}</DialogTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{selectedReport.teacher.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(selectedReport.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {PERIOD_LABELS[selectedReport.period as keyof typeof PERIOD_LABELS]}
                  </Badge>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-gray-700">{selectedReport.summary}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedReport.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {selectedReport.goodBehaviors}
                    </p>
                    <p className="text-sm text-gray-600">Good Behaviors</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-600">
                      {selectedReport.badBehaviors}
                    </p>
                    <p className="text-sm text-gray-600">Behaviors to Work On</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-600">
                      #{selectedReport.rank}
                    </p>
                    <p className="text-sm text-gray-600">Class Rank</p>
                  </div>
                </div>

                {/* Report Sections */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Report Sections</h3>
                  <div className="space-y-4">
                    {selectedReport.sections.map((section: any, index: number) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-base">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{section.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Teacher Notes */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Teacher Notes</h3>
                  <p className="text-gray-700 italic">{selectedReport.teacherNotes}</p>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                  <p className="text-gray-700">{selectedReport.recommendations}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => handleDownloadReport(selectedReport)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Teacher
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