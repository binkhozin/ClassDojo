import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClassSchema, CreateClassValues } from "../../lib/validations/classSchemas";
import { useCreateClass } from "../../hooks/useClasses";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select } from "../../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

const CreateClassPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createClassMutation = useCreateClass();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClassValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      academic_year: new Date().getFullYear().toString() + "-" + (new Date().getFullYear() + 1).toString(),
      color: "#3b82f6",
      max_points: 100,
    },
  });

  const onSubmit = async (data: CreateClassValues) => {
    if (!user) return;

    try {
      const newClass = await createClassMutation.mutateAsync({
        ...data,
        teacher_id: user.id,
      });
      toast.success("Class created successfully!");
      navigate(`/teacher/classes/${newClass.id}`);
    } catch (error) {
      toast.error("Failed to create class. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button 
        variant="ghost" 
        className="mb-6 -ml-2" 
        onClick={() => navigate("/teacher/dashboard")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Class</CardTitle>
          <CardDescription>
            Enter the details for your new class. You can always change these later.
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
                onClick={() => navigate("/teacher/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createClassMutation.isPending}>
                {createClassMutation.isPending ? "Creating..." : "Create Class"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateClassPage;
