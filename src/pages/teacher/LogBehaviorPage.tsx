import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { useStudents } from "../../hooks/useStudents";
import { useBehaviorCategories } from "../../hooks/useBehaviorCategories";
import { useLogBehavior } from "../../hooks/useLogBehavior";
import { ConfettiAnimation } from "../../components/gamification/ConfettiAnimation";
import { PointsFloatingAnimation } from "../../components/gamification/PointsFloatingAnimation";
import { toast } from "sonner";
import { useHotkeys } from "react-hotkeys-hook";

const logBehaviorSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  categoryId: z.string().min(1, "Category is required"),
  note: z.string().optional(),
  createdAt: z.string().optional(),
});

type LogBehaviorFormValues = z.infer<typeof logBehaviorSchema>;

export const LogBehaviorPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  const [pointsToShow, setPointsToShow] = useState(0);
  const [keepOpen, setKeepOpen] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const { data: students, isLoading: studentsLoading } = useStudents(classId);
  const { data: categories, isLoading: categoriesLoading } = useBehaviorCategories(classId);
  const { mutate: logBehavior, isPending } = useLogBehavior();

  const form = useForm<LogBehaviorFormValues>({
    resolver: zodResolver(logBehaviorSchema),
    defaultValues: {
      studentId: "",
      categoryId: "",
      note: "",
      createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const selectedStudent = students?.find(s => s.id === form.watch("studentId"));
  const selectedCategory = categories?.find(c => c.id === form.watch("categoryId"));

  const handleSubmit = (data: LogBehaviorFormValues) => {
    if (!classId || !selectedCategory) return;

    const behaviorData = {
      student_id: data.studentId,
      class_id: classId,
      category_id: data.categoryId,
      teacher_id: "current-teacher-id", // Replace with actual teacher ID
      points: selectedCategory.point_value,
      note: data.note || null,
      created_at: data.createdAt || new Date().toISOString(),
    };

    logBehavior(behaviorData, {
      onSuccess: () => {
        setPointsToShow(selectedCategory.point_value);
        setShowConfetti(true);
        setShowPointsAnimation(true);
        
        // Get button position for points animation
        if (submitButtonRef.current) {
          const rect = submitButtonRef.current.getBoundingClientRect();
          setAnimationPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        }

        toast.success("Behavior logged successfully!");
        
        if (!keepOpen) {
          navigate(`/teacher/classes/${classId}/behaviors/history`);
        } else {
          form.reset({
            studentId: data.studentId,
            categoryId: "",
            note: "",
            createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          });
        }
      },
    });
  };

  // Keyboard shortcuts
  useHotkeys("ctrl+s", (e) => {
    e.preventDefault();
    form.handleSubmit(handleSubmit)();
  });

  if (studentsLoading || categoriesLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ConfettiAnimation 
        trigger={showConfetti} 
        duration={3000} 
        onComplete={() => setShowConfetti(false)}
      />

      {showPointsAnimation && (
        <PointsFloatingAnimation 
          points={pointsToShow} 
          x={animationPosition.x}
          y={animationPosition.y}
          onComplete={() => setShowPointsAnimation(false)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Log Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Selection */}
              <div className="space-y-2">
                <label htmlFor="studentId" className="text-sm font-medium">
                  Student
                </label>
                <Select 
                  onValueChange={(value) => form.setValue("studentId", value)} 
                  value={form.watch("studentId")}
                  options={students?.map(student => ({
                    value: student.id,
                    label: `${student.first_name} ${student.last_name}`
                  })) || []}
                  placeholder="Select a student"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <label htmlFor="categoryId" className="text-sm font-medium">
                  Behavior Category
                </label>
                <Select 
                  onValueChange={(value) => form.setValue("categoryId", value)} 
                  value={form.watch("categoryId")}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          {category.icon && <span>{category.icon}</span>}
                          <span>{category.name}</span>
                          <span className={`ml-auto ${category.point_value > 0 ? "text-green-600" : "text-red-600"}`}>
                            {category.point_value > 0 ? "+" : ""}{category.point_value}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Points Display */}
            {selectedCategory && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {selectedCategory.icon}
                    </span>
                    <span className="text-lg font-medium">{selectedCategory.name}</span>
                  </div>
                  <div className={`text-3xl font-bold ${selectedCategory.point_value > 0 ? "text-green-600" : "text-red-600"}`}>
                    {selectedCategory.point_value > 0 ? "+" : ""}{selectedCategory.point_value} points
                  </div>
                </div>
                {selectedCategory.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {selectedCategory.description}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">
                Notes (optional)
              </label>
              <Textarea 
                id="note" 
                placeholder="Add any additional notes..." 
                className="min-h-[100px]" 
                {...form.register("note")}
              />
            </div>

            {/* Timestamp */}
            <div className="space-y-2">
              <label htmlFor="createdAt" className="text-sm font-medium">
                Timestamp
              </label>
              <Input 
                id="createdAt" 
                type="datetime-local" 
                {...form.register("createdAt")}
              />
            </div>

            {/* Quick Multiple Log Option */}
            <div className="flex items-center space-x-2">
              <input 
                id="keepOpen" 
                type="checkbox" 
                checked={keepOpen} 
                onChange={(e) => setKeepOpen(e.target.checked)} 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="keepOpen" className="text-sm text-gray-600 dark:text-gray-400">
                Keep form open after logging
              </label>
            </div>

            {/* Keyboard Shortcut Hint */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                Ctrl + S
              </kbd> to save
            </div>

            {/* Submit Button */}
            <Button 
              ref={submitButtonRef} 
              type="submit" 
              disabled={isPending || !form.watch("studentId") || !form.watch("categoryId")}
              className="w-full md:w-auto"
            >
              {isPending ? "Logging..." : "Log Behavior"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};