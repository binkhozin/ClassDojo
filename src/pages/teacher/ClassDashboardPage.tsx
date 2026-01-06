import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  Star, 
  Settings, 
  MessageSquare, 
  LayoutDashboard, 
  Plus,
  Trash2,
  Calendar,
  ChevronLeft
} from "lucide-react";
import { useClass } from "../../hooks/useClasses";
import { useStudents, useDeleteStudent } from "../../hooks/useStudents";
import { useClassBehaviors, useDeleteBehavior } from "../../hooks/useBehaviors";
import { useBehaviorCategories, useCreateBehaviorCategory, useUpdateBehaviorCategory, useDeleteBehaviorCategory } from "../../hooks/useBehaviorCategories";
import { useClassSettings, useUpdateClassSettings } from "../../hooks/useClassSettings";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { StudentTable } from "../../components/teacher/StudentTable";
import { BehaviorLog } from "../../components/teacher/BehaviorLog";
import { BehaviorCategoryForm } from "../../components/teacher/BehaviorCategoryForm";
import { ClassSettingsForm } from "../../components/teacher/ClassSettingsForm";
import { BehaviorTrendChart } from "../../components/teacher/charts/BehaviorTrendChart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

const ClassDashboardPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  
  const { data: classData, isLoading: isLoadingClass } = useClass(classId);
  const { data: students, isLoading: isLoadingStudents } = useStudents(classId);
  const { data: behaviors, isLoading: isLoadingBehaviors } = useClassBehaviors(classId);
  const { data: categories, isLoading: isLoadingCategories } = useBehaviorCategories(classId);
  const { data: settings, isLoading: isLoadingSettings } = useClassSettings(classId);

  const deleteStudentMutation = useDeleteStudent();
  const deleteBehaviorMutation = useDeleteBehavior();
  const createCategoryMutation = useCreateBehaviorCategory();
  const updateSettingsMutation = useUpdateClassSettings();
  const deleteCategoryMutation = useDeleteBehaviorCategory();

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm("Are you sure you want to remove this student? This action cannot be undone.")) {
      try {
        await deleteStudentMutation.mutateAsync(studentId);
        toast.success("Student removed successfully");
      } catch (error) {
        toast.error("Failed to remove student");
      }
    }
  };

  const handleDeleteBehavior = async (behaviorId: string) => {
    try {
      await deleteBehaviorMutation.mutateAsync(behaviorId);
      toast.success("Behavior log deleted");
    } catch (error) {
      toast.error("Failed to delete behavior log");
    }
  };

  const handleCreateCategory = async (data: any) => {
    if (!classId) return;
    try {
      await createCategoryMutation.mutateAsync({
        ...data,
        class_id: classId,
      });
      toast.success("Category added successfully");
      setIsAddCategoryOpen(false);
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleUpdateSettings = async (data: any) => {
    if (!classId) return;
    try {
      await updateSettingsMutation.mutateAsync({
        classId,
        updates: data,
      });
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!classId) return;
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategoryMutation.mutateAsync({ id, classId });
        toast.success("Category deleted");
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  if (isLoadingClass) {
    return <div className="container mx-auto py-8 text-center">Loading class dashboard...</div>;
  }

  if (!classData) {
    return <div className="container mx-auto py-8 text-center text-destructive">Class not found.</div>;
  }

  const behaviorsToday = behaviors?.filter(b => 
    format(new Date(b.created_at!), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" className="-ml-2" onClick={() => navigate("/teacher/dashboard")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge style={{ backgroundColor: classData.color || "hsl(var(--primary))" }}>
              {classData.grade || "Class"}
            </Badge>
            <span className="text-sm text-muted-foreground">{classData.academic_year}</span>
          </div>
          <h1 className="text-3xl font-bold">{classData.name}</h1>
          <p className="text-muted-foreground mt-1">
            {students?.length || 0} Students &bull; Last activity: {behaviors?.[0] ? format(new Date(behaviors[0].created_at!), "MMM d, h:mm a") : "No activity yet"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/teacher/classes/${classId}/edit`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/teacher/classes/${classId}/students/add`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="mr-2 h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="behaviors">
            <Star className="mr-2 h-4 w-4" />
            Behaviors
          </TabsTrigger>
          <TabsTrigger value="communications">
            <MessageSquare className="mr-2 h-4 w-4" />
            Parents
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Class Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Behaviors Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{behaviorsToday.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {behaviorsToday.filter(b => b.points > 0).length} Positive, {behaviorsToday.filter(b => b.points < 0).length} Negative
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Points Distributed Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {behaviorsToday.reduce((acc, curr) => acc + curr.points, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average {behaviorsToday.length > 0 ? (behaviorsToday.reduce((acc, curr) => acc + curr.points, 0) / behaviorsToday.length).toFixed(1) : 0} per behavior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Student Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(behaviorsToday.map(b => b.student_id)).size} / {students?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Students active today</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Behavior Trends</CardTitle>
                <CardDescription>Activity from the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <BehaviorTrendChart behaviors={behaviors || []} />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest behavior logs for this class</CardDescription>
              </CardHeader>
              <CardContent>
                <BehaviorLog behaviors={behaviors?.slice(0, 5) || []} onDelete={handleDeleteBehavior} />
                {behaviors && behaviors.length > 5 && (
                  <Button variant="link" className="mt-4 w-full" onClick={() => {}}>View all activity</Button>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for managing your class</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to={`/teacher/classes/${classId}/students/add`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add a new student
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="mr-2 h-4 w-4" />
                  Award points to whole class
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message all parents
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule an event
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>Manage students in this class</CardDescription>
              </div>
              <Button asChild>
                <Link to={`/teacher/classes/${classId}/students/add`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <StudentTable 
                students={students || []} 
                onDelete={handleDeleteStudent}
                onManageParents={(student) => navigate(`/teacher/classes/${classId}/students/${student.id}/parents`)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behaviors" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Behavior Categories</CardTitle>
                  <CardDescription>Categories available for logging</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsAddCategoryOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories?.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{cat.icon}</div>
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          <Badge variant={cat.type === "positive" ? "default" : "destructive"} className="text-[10px] h-4">
                            {cat.point_value > 0 ? "+" : ""}{cat.point_value} points
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <p className="text-center py-4 text-muted-foreground">No categories defined yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Behavior History</CardTitle>
                <CardDescription>All behaviors logged in this class</CardDescription>
              </CardHeader>
              <CardContent>
                <BehaviorLog behaviors={behaviors || []} onDelete={handleDeleteBehavior} />
              </CardContent>
            </Card>
          </div>

          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Behavior Category</DialogTitle>
              </DialogHeader>
              <BehaviorCategoryForm 
                onSubmit={handleCreateCategory} 
                onCancel={() => setIsAddCategoryOpen(false)}
                isLoading={createCategoryMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Parent Communications</CardTitle>
              <CardDescription>Manage connections and messages with parents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">Coming Soon</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                  The parent communication portal is being finalized. Soon you'll be able to message parents directly and share reports.
                </p>
                <Button className="mt-6" variant="outline" asChild>
                  <Link to={`/teacher/classes/${classId}/students`}>View connected parents per student</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Class Settings</CardTitle>
              <CardDescription>Customize how this class functions</CardDescription>
            </CardHeader>
            <CardContent>
              <ClassSettingsForm 
                initialData={settings || null} 
                onSubmit={handleUpdateSettings}
                isLoading={updateSettingsMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDashboardPage;
