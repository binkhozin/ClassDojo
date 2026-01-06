import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { useStudents } from "../../hooks/useStudents";
import { useAwardBadge } from "../../hooks/useAwardBadge";
import { toast } from "sonner";
import { badgeSchema } from "../../lib/validations/badgeSchemas";
import { supabase } from "../../integrations/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type BadgeFormValues = z.infer<typeof badgeSchema>;

export const BadgesPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  const queryClient = useQueryClient();
  const { data: students } = useStudents(classId);
  const { mutate: awardBadge } = useAwardBadge();

  // Fetch badges
  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ["badges", classId],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  // Fetch student badges
  const { data: studentBadges, isLoading: studentBadgesLoading } = useQuery({
    queryKey: ["student-badges", classId],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from("student_badges")
        .select(
          `
          *,
          badge:badges(*),
          student:students(*)
        `
        )
        .eq("badge:class_id", classId)
        .order("earned_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  // Create badge mutation
  const createBadgeMutation = useMutation({
    mutationFn: async (badgeData: BadgeFormValues) => {
      if (!classId) throw new Error("Class ID is required");
      
      const { data, error } = await supabase
        .from("badges")
        .insert({
          ...badgeData,
          class_id: classId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges", classId] });
      toast.success("Badge created successfully!");
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create badge: " + error.message);
    }
  });

  // Update badge mutation
  const updateBadgeMutation = useMutation({
    mutationFn: async ({ id, ...badgeData }: { id: string; } & BadgeFormValues) => {
      const { data, error } = await supabase
        .from("badges")
        .update(badgeData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges", classId] });
      toast.success("Badge updated successfully!");
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to update badge: " + error.message);
    }
  });

  // Delete badge mutation
  const deleteBadgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("badges")
        .delete()
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges", classId] });
      toast.success("Badge deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete badge: " + error.message);
    }
  });

  const form = useForm<BadgeFormValues>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "🏅",
      requirementType: "points_threshold",
      requirementValue: 100,
    },
  });

  const handleCreateBadge = (data: BadgeFormValues) => {
    createBadgeMutation.mutate(data);
  };

  const handleUpdateBadge = (data: BadgeFormValues) => {
    if (!selectedBadge) return;
    updateBadgeMutation.mutate({ id: selectedBadge.id, ...data });
  };

  const handleDeleteBadge = (id: string) => {
    deleteBadgeMutation.mutate(id);
  };

  const handleAwardBadge = () => {
    if (!selectedBadge || !selectedStudent) return;
    
    awardBadge(
      { studentId: selectedStudent, badgeId: selectedBadge.id },
      {
        onSuccess: () => {
          toast.success("Badge awarded successfully!");
          setIsAwardDialogOpen(false);
          setSelectedStudent("");
          queryClient.invalidateQueries({ queryKey: ["student-badges", classId] });
        },
      }
    );
  };

  const openEditDialog = (badge: any) => {
    setSelectedBadge(badge);
    form.reset({
      name: badge.name,
      description: badge.description || "",
      icon: badge.icon || "🏅",
      requirementType: badge.requirement_type,
      requirementValue: badge.requirement_value,
    });
    setIsCreateDialogOpen(true);
  };

  const getRequirementText = (badge: any) => {
    switch (badge.requirement_type) {
      case "points_threshold":
        return `Reach ${badge.requirement_value} points`;
      case "behavior_count":
        return `Earn ${badge.requirement_value} positive behaviors`;
      case "achievement":
        return "Special achievement";
      default:
        return "Unknown requirement";
    }
  };

  if (badgesLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading badges...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Badges & Achievements</CardTitle>
          <CardDescription>Create and manage badges to motivate your students</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  Create New Badge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{selectedBadge ? "Edit Badge" : "Create New Badge"}</DialogTitle>
                </DialogHeader>
                <form 
                  onSubmit={form.handleSubmit(selectedBadge ? handleUpdateBadge : handleCreateBadge)}
                  className="space-y-4 py-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Badge Name
                    </label>
                    <Input 
                      id="name" 
                      placeholder="Perfect Attendance" 
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description (optional)
                    </label>
                    <Textarea 
                      id="description" 
                      placeholder="Awarded for perfect attendance in a month" 
                      className="min-h-[100px]" 
                      {...form.register("description")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="icon" className="text-sm font-medium">
                      Icon/Emoji
                    </label>
                    <Input 
                      id="icon" 
                      placeholder="🏅" 
                      {...form.register("icon")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="requirementType" className="text-sm font-medium">
                      Requirement Type
                    </label>
                    <Select 
                      onValueChange={(value: any) => form.setValue("requirementType", value)} 
                      value={form.watch("requirementType")}
                      options={[
                        { value: "points_threshold", label: "Points Threshold" },
                        { value: "behavior_count", label: "Behavior Count" },
                        { value: "achievement", label: "Special Achievement" }
                      ]}
                      placeholder="Select requirement type"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="requirementValue" className="text-sm font-medium">
                      Requirement Value
                    </label>
                    <Input 
                      id="requirementValue" 
                      type="number" 
                      min="1" 
                      {...form.register("requirementValue")}
                    />
                    {form.formState.errors.requirementValue && (
                      <p className="text-sm text-red-600">{form.formState.errors.requirementValue.message}</p>
                    )}
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={createBadgeMutation.isPending || updateBadgeMutation.isPending}>
                      {createBadgeMutation.isPending || updateBadgeMutation.isPending ? "Saving..." : selectedBadge ? "Update Badge" : "Create Badge"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {badges && badges.length > 0 ? (
              badges.map((badge) => {
                const earnedCount = studentBadges?.filter(sb => sb.badge_id === badge.id).length || 0;
                const totalStudents = students?.length || 1;
                const progress = Math.round((earnedCount / totalStudents) * 100);

                return (
                  <Card key={badge.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-3xl">{badge.icon || "🏅"}</div>
                        <div className="text-sm text-gray-500">
                          {earnedCount}/{totalStudents}
                        </div>
                      </div>
                      <h3 className="font-semibold mb-1">{badge.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{badge.description}</p>
                      <div className="text-xs text-gray-400 mb-3">
                        {getRequirementText(badge)}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1" 
                          onClick={() => {
                            setSelectedBadge(badge);
                            setIsAwardDialogOpen(true);
                          }}
                        >
                          Award
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1" 
                          onClick={() => openEditDialog(badge)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex-1" 
                          onClick={() => handleDeleteBadge(badge.id)}
                        >
                          Delete
                        </Button>
                      </div>
                      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 col-span-full">
                No badges created yet. Create your first badge!
              </div>
            )}
          </div>

          {/* Earned Badges Table */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Earned Badges</h3>
            {studentBadges && studentBadges.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Badge</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Date Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentBadges.map((studentBadge: any) => (
                      <TableRow key={studentBadge.id}>
                        <TableCell>
                          {studentBadge.student?.first_name} {studentBadge.student?.last_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{studentBadge.badge?.icon || "🏅"}</span>
                            <span>{studentBadge.badge?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRequirementText(studentBadge.badge)}
                        </TableCell>
                        <TableCell>
                          {new Date(studentBadge.earned_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No badges have been earned yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Award Badge Dialog */}
      <Dialog open={isAwardDialogOpen} onOpenChange={setIsAwardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Badge</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedBadge && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-4xl">{selectedBadge.icon || "🏅"}</div>
                <div>
                  <div className="font-medium">{selectedBadge.name}</div>
                  <div className="text-sm text-gray-500">{selectedBadge.description}</div>
                  <div className="mt-2 text-sm">
                    {getRequirementText(selectedBadge)}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="student" className="text-sm font-medium">
                Select Student
              </label>
              <Select 
                onValueChange={setSelectedStudent} 
                value={selectedStudent}
                options={students?.map(student => ({
                  value: student.id,
                  label: `${student.first_name} ${student.last_name}`
                })) || []}
                placeholder="Select a student"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAwardDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAwardBadge} 
              disabled={!selectedStudent || awardBadge.isPending}
            >
              {awardBadge.isPending ? "Awarding..." : "Award Badge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};