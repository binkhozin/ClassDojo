import React, { useState, useEffect } from "react";
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
import { Checkbox } from "../../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { useStudents } from "../../hooks/useStudents";
import { useRewardRedemption } from "../../hooks/useRewardRedemption";
import { toast } from "sonner";
import { rewardSchema } from "../../lib/validations/rewardSchemas";
import { supabase } from "../../integrations/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type RewardFormValues = z.infer<typeof rewardSchema>;

export const RewardsManagementPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const queryClient = useQueryClient();
  const { data: students } = useStudents(classId);
  const { mutate: redeemReward } = useRewardRedemption();

  // Fetch rewards
  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ["rewards", classId],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  // Fetch redemption history
  const { data: redemptionHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["reward-redemptions", classId],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from("student_rewards")
        .select(
          `
          *,
          reward:rewards(*),
          student:students(*)
        `
        )
        .eq("reward:class_id", classId)
        .order("earned_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  // Create reward mutation
  const createRewardMutation = useMutation({
    mutationFn: async (rewardData: RewardFormValues) => {
      if (!classId) throw new Error("Class ID is required");
      
      const { data, error } = await supabase
        .from("rewards")
        .insert({
          ...rewardData,
          class_id: classId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards", classId] });
      toast.success("Reward created successfully!");
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create reward: " + error.message);
    }
  });

  // Update reward mutation
  const updateRewardMutation = useMutation({
    mutationFn: async ({ id, ...rewardData }: { id: string; } & RewardFormValues) => {
      const { data, error } = await supabase
        .from("rewards")
        .update(rewardData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards", classId] });
      toast.success("Reward updated successfully!");
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to update reward: " + error.message);
    }
  });

  // Delete reward mutation
  const deleteRewardMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("rewards")
        .delete()
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards", classId] });
      toast.success("Reward deleted successfully!");
      setSelectedRewards([]);
      setSelectAll(false);
    },
    onError: (error) => {
      toast.error("Failed to delete reward: " + error.message);
    }
  });

  // Toggle reward status mutation
  const toggleRewardStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("rewards")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards", classId] });
    },
    onError: (error) => {
      toast.error("Failed to update reward status: " + error.message);
    }
  });

  const form = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: "",
      description: "",
      pointCost: 10,
      icon: "🎁",
      color: "#3B82F6",
      isActive: true,
    },
  });

  const handleCreateReward = (data: RewardFormValues) => {
    createRewardMutation.mutate(data);
  };

  const handleUpdateReward = (data: RewardFormValues) => {
    if (!selectedReward) return;
    updateRewardMutation.mutate({ id: selectedReward.id, ...data });
  };

  const handleDeleteReward = (id: string) => {
    deleteRewardMutation.mutate(id);
  };

  const handleBulkDelete = () => {
    selectedRewards.forEach(id => {
      deleteRewardMutation.mutate(id);
    });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleRewardStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleBulkToggleStatus = (newStatus: boolean) => {
    selectedRewards.forEach(id => {
      const reward = rewards?.find(r => r.id === id);
      if (reward?.is_active !== newStatus) {
        toggleRewardStatusMutation.mutate({ id, isActive: newStatus });
      }
    });
  };

  const handleRedeemReward = () => {
    if (!selectedReward || !selectedStudent) return;
    
    redeemReward(
      { studentId: selectedStudent, rewardId: selectedReward.id },
      {
        onSuccess: (data) => {
          toast.success(`Reward redeemed! ${data.pointsDeducted} points deducted`);
          setIsRedeemDialogOpen(false);
          setSelectedStudent("");
          queryClient.invalidateQueries({ queryKey: ["reward-redemptions", classId] });
        },
      }
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRewards([]);
    } else {
      setSelectedRewards(rewards?.map(r => r.id) || []);
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectReward = (id: string) => {
    setSelectedRewards(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const openEditDialog = (reward: any) => {
    setSelectedReward(reward);
    form.reset({
      name: reward.name,
      description: reward.description || "",
      pointCost: reward.point_cost,
      icon: reward.icon || "🎁",
      color: reward.color || "#3B82F6",
      isActive: reward.is_active || true,
    });
    setIsCreateDialogOpen(true);
  };

  if (rewardsLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading rewards...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Rewards Management</CardTitle>
          <CardDescription>Create and manage rewards for your class</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  Create New Reward
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{selectedReward ? "Edit Reward" : "Create New Reward"}</DialogTitle>
                </DialogHeader>
                <form 
                  onSubmit={form.handleSubmit(selectedReward ? handleUpdateReward : handleCreateReward)}
                  className="space-y-4 py-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Reward Name
                    </label>
                    <Input 
                      id="name" 
                      placeholder="Homework Pass" 
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
                      placeholder="Get out of one homework assignment" 
                      className="min-h-[100px]" 
                      {...form.register("description")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="pointCost" className="text-sm font-medium">
                      Point Cost
                    </label>
                    <Input 
                      id="pointCost" 
                      type="number" 
                      min="1" 
                      {...form.register("pointCost")}
                    />
                    {form.formState.errors.pointCost && (
                      <p className="text-sm text-red-600">{form.formState.errors.pointCost.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="icon" className="text-sm font-medium">
                      Icon/Emoji
                    </label>
                    <Input 
                      id="icon" 
                      placeholder="🎁" 
                      {...form.register("icon")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="color" className="text-sm font-medium">
                      Color
                    </label>
                    <Input 
                      id="color" 
                      type="color" 
                      {...form.register("color")}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isActive" 
                      checked={form.watch("isActive")}
                      onCheckedChange={(checked) => form.setValue("isActive", checked as boolean)}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                      Active
                    </label>
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={createRewardMutation.isPending || updateRewardMutation.isPending}>
                      {createRewardMutation.isPending || updateRewardMutation.isPending ? "Saving..." : selectedReward ? "Update Reward" : "Create Reward"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {selectedRewards.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkToggleStatus(true)}
                  disabled={selectedRewards.some(id => rewards?.find(r => r.id === id)?.is_active)}
                >
                  Enable Selected
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkToggleStatus(false)}
                  disabled={selectedRewards.some(id => !rewards?.find(r => r.id === id)?.is_active)}
                >
                  Disable Selected
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </div>
            )}
          </div>

          {/* Rewards Table */}
          {rewards && rewards.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={selectAll && selectedRewards.length === rewards.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Redemptions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedRewards.includes(reward.id)}
                          onCheckedChange={() => toggleSelectReward(reward.id)}
                          aria-label="Select reward"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center" 
                            style={{ backgroundColor: reward.color || "#3B82F6" }}
                          >
                            <span className="text-xl">{reward.icon || "🎁"}</span>
                          </div>
                          <div>
                            <div className="font-medium">{reward.name}</div>
                            <div className="text-sm text-gray-500">{reward.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {reward.point_cost} points
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {redemptionHistory?.filter(r => r.reward_id === reward.id).length || 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={reward.is_active ? "default" : "secondary"}>
                          {reward.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedReward(reward);
                              setIsRedeemDialogOpen(true);
                            }}
                          >
                            Redeem
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditDialog(reward)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleStatus(reward.id, reward.is_active)}
                          >
                            {reward.is_active ? "Disable" : "Enable"}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteReward(reward.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No rewards created yet. Create your first reward!
            </div>
          )}

          {/* Redemption History */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Redemption History</h3>
            {redemptionHistory && redemptionHistory.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptionHistory.map((redemption: any) => (
                      <TableRow key={redemption.id}>
                        <TableCell>
                          {redemption.student?.first_name} {redemption.student?.last_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{redemption.reward?.icon || "🎁"}</span>
                            <span>{redemption.reward?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {redemption.reward?.point_cost} points
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(redemption.earned_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No redemptions yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Redeem Reward Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Reward</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedReward && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center" 
                  style={{ backgroundColor: selectedReward.color || "#3B82F6" }}
                >
                  <span className="text-2xl">{selectedReward.icon || "🎁"}</span>
                </div>
                <div>
                  <div className="font-medium">{selectedReward.name}</div>
                  <div className="text-sm text-gray-500">{selectedReward.description}</div>
                  <div className="mt-2">
                    <Badge variant="secondary">
                      {selectedReward.point_cost} points required
                    </Badge>
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

            {selectedStudent && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                Student's current points: <strong>N/A</strong> {/* Would fetch actual points in real implementation */}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRedeemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRedeemReward} 
              disabled={!selectedStudent || redeemReward.isPending}
            >
              {redeemReward.isPending ? "Redeeming..." : "Confirm Redemption"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};