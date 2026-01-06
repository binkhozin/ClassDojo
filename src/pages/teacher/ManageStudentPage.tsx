import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStudentSchema, CreateStudentValues } from "../../lib/validations/studentSchemas";
import { useStudent, useCreateStudent, useUpdateStudent } from "../../hooks/useStudents";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

const ManageStudentPage: React.FC = () => {
  const { classId, studentId } = useParams<{ classId: string; studentId: string }>();
  const navigate = useNavigate();
  const isEditing = !!studentId;

  const { data: studentData, isLoading: isLoadingStudent } = useStudent(studentId);
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStudentValues>({
    resolver: zodResolver(createStudentSchema),
  });

  useEffect(() => {
    if (studentData && isEditing) {
      reset({
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        email: studentData.email || "",
        date_of_birth: studentData.date_of_birth || "",
        notes: studentData.notes || "",
        avatar_url: studentData.avatar_url || "",
      });
    }
  }, [studentData, isEditing, reset]);

  const onSubmit = async (data: CreateStudentValues) => {
    if (!classId) return;

    try {
      if (isEditing) {
        await updateStudentMutation.mutateAsync({
          id: studentId,
          updates: data,
        });
        toast.success("Student updated successfully!");
      } else {
        await createStudentMutation.mutateAsync({
          ...data,
          class_id: classId,
        });
        toast.success("Student added successfully!");
      }
      navigate(`/teacher/classes/${classId}`);
    } catch (error) {
      toast.error(`Failed to ${isEditing ? "update" : "add"} student. Please try again.`);
    }
  };

  if (isEditing && isLoadingStudent) {
    return <div className="container mx-auto py-8 text-center">Loading student details...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button 
        variant="ghost" 
        className="mb-6 -ml-2" 
        onClick={() => navigate(`/teacher/classes/${classId}`)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Class
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditing ? "Edit Student" : "Add New Student"}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? "Update the information for this student." 
              : "Add a new student to your class roster."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name*</Label>
                <Input id="first_name" {...register("first_name")} />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name*</Label>
                <Input id="last_name" {...register("last_name")} />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" type="email" {...register("email")} placeholder="parent@example.com" />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                {...register("notes")} 
                placeholder="Any special notes about this student..."
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
              <Button type="submit" disabled={createStudentMutation.isPending || updateStudentMutation.isPending}>
                {isEditing 
                  ? (updateStudentMutation.isPending ? "Updating..." : "Update Student")
                  : (createStudentMutation.isPending ? "Adding..." : "Add Student")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageStudentPage;
