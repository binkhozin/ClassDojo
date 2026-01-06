import React from "react";
import { Link } from "react-router-dom";
import { Plus, Users, Star, MessageSquare, ClipboardList } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { useClasses, useTeacherSummary } from "../../hooks/useClasses";
import { QuickStatsCards } from "../../components/teacher/QuickStatsCards";
import { ClassCard } from "../../components/teacher/ClassCard";
import { useDeleteClass } from "../../hooks/useClasses";
import { toast } from "sonner";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: classes, isLoading: isLoadingClasses } = useClasses(user?.id);
  const { data: summary, isLoading: isLoadingSummary } = useTeacherSummary(user?.id);
  const deleteClassMutation = useDeleteClass();

  const handleDeleteClass = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this class? This will also delete all students and behaviors associated with it.")) {
      try {
        await deleteClassMutation.mutateAsync(id);
        toast.success("Class deleted successfully");
      } catch (error) {
        toast.error("Failed to delete class");
      }
    }
  };

  const isLoading = isLoadingClasses || isLoadingSummary;

  const totalStudents = summary?.reduce((acc: number, curr: any) => acc + curr.total_students, 0) || 0;
  const behaviorsToday = summary?.reduce((acc: number, curr: any) => acc + (curr.total_behaviors || 0), 0) || 0; 

  const stats = [
    {
      title: "Total Classes",
      value: classes?.length || 0,
      icon: ClipboardList,
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
    },
    {
      title: "Behaviors Today",
      value: behaviorsToday,
      icon: Star,
    },
    {
      title: "Pending Messages",
      value: summary?.reduce((acc: number, curr: any) => acc + (curr.unread_messages || 0), 0) || 0,
      icon: MessageSquare,
    },
  ];

  const classesWithCounts = classes?.map(cls => {
    const classSummary = summary?.find((s: any) => s.class_id === cls.id);
    return {
      ...cls,
      studentCount: classSummary?.total_students || 0
    };
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.user_metadata?.full_name || "Teacher"}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your classes today.</p>
        </div>
        <Button asChild>
          <Link to="/teacher/classes/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Class
          </Link>
        </Button>
      </div>

      <QuickStatsCards stats={stats} />

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">My Classes</h2>
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : classesWithCounts && classesWithCounts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classesWithCounts.map((cls) => (
              <ClassCard 
                key={cls.id} 
                classData={cls} 
                onDelete={handleDeleteClass} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/30">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium">No classes yet</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-xs">
              Get started by creating your first class to manage your students and track behaviors.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/teacher/classes/create">
                <Plus className="mr-2 h-4 w-4" />
                Create First Class
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
