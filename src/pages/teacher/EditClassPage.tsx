import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClassSchema, CreateClassValues } from "../../lib/validations/classSchemas";
import { useClass, useUpdateClass, useDeleteClass } from "../../hooks/useClasses";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select } from "../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { ChevronLeft, Trash2 } from "lucide-react";

const EditClassPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { data: classData, isLoading: isLoadingClass } = useClass(classId);
  const updateClassMutation = useUpdateClass();
  const deleteClassMutation = useDeleteClass();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClassValues>({
    resolver: zodResolver(createClassSchema),
  });

  useEffect(() => {
    if (classData) {
      reset({
        name: classData.name,
        grade: classData.grade || "",
        description: classData.description || "",
        school_name: classData.school_name || "",
        academic_year: classData.academic_year,
        color: classData.color || "#3b82f6",
        max_points: classData.max_points || 100,
      });
    }
  }, [classData, reset]);

  const onSubmit = async (data: CreateClassValues) => {
    if (!classId) return;

    try {
      await updateClassMutation.mutateAsync({
        id: classId,
        updates: data,
      });
      toast.success("Class updated successfully!");
      navigate(`/teacher/classes/${classId}`);
    } catch (error) {
      toast.error("Failed to update class. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!classId) return;
    if (window.confirm("Are you sure you want to delete this class? This will also delete all students and behaviors associated with it.")) {
      try {
        await deleteClassMutation.mutateAsync(classId);
        toast.success("Class deleted successfully");
        navigate("/teacher/dashboard");
      } catch (error) {
        toast.error("Failed to delete class");
      }
    }
  };

  if (isLoadingClass) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading class details...</div>;
  }

  if (!classData) {
    return <div className="container mx-auto py-8 px-4 text-center text-destructive">Class not found.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          className="-ml-2" 
          onClick={() => navigate(`/teacher/classes/${classId}`)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Class
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Class: {classData.name}</CardTitle>
          <CardDescription>
            Update your class information and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Class Name*</Label>
              <Input id="name" {...register("name")} placeholder="e.g. 5th Grade Math" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade">Grade Level</Label>
                <Select id="grade" {...register("grade")}>
                  <option value="">Select Grade</option>
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="1st Grade">1st Grade</option>
                  <option value="2nd Grade">2nd Grade</option>
                  <option value="3rd Grade">3rd Grade</option>
                  <option value="4th Grade">4th Grade</option>
                  <option value="5th Grade">5th Grade</option>
                  <option value="6th Grade">6th Grade</option>
                  <option value="7th Grade">7th Grade</option>
                  <option value="8th Grade">8th Grade</option>
                  <option value="High School">High School</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="academic_year">Academic Year*</Label>
                <Input id="academic_year" {...register("academic_year")} placeholder="e.g. 2024-2025" />
                {errors.academic_year && (
                  <p className="text-sm text-destructive">{errors.academic_year.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="school_name">School Name</Label>
              <Input id="school_name" {...register("school_name")} placeholder="e.g. Lincoln Elementary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="color">Class Color</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    id="color" 
                    type="color" 
                    {...register("color")} 
                    className="w-12 h-10 p-1"
                  />
                  <span className="text-sm text-muted-foreground">Choose a theme color</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_points">Max Points (Goal)</Label>
                <Input id="max_points" type="number" {...register("max_points")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                {...register("description")} 
                placeholder="Briefly describe this class..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/teacher/classes/${classId}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateClassMutation.isPending}>
                {updateClassMutation.isPending ? "Updating..." : "Update Class"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditClassPage;
