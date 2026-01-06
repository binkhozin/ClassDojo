import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  classSettingsSchema, 
  ClassSettingsValues 
} from "../../lib/validations/classSchemas";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import type { Database } from "../../types";

type ClassSettings = Database["public"]["Tables"]["class_settings"]["Row"];

interface ClassSettingsFormProps {
  initialData: ClassSettings | null;
  onSubmit: (data: ClassSettingsValues) => void;
  isLoading?: boolean;
}

export const ClassSettingsForm: React.FC<ClassSettingsFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClassSettingsValues>({
    resolver: zodResolver(classSettingsSchema),
    defaultValues: {
      points_per_good_behavior: initialData?.points_per_good_behavior || 1,
      points_per_bad_behavior: initialData?.points_per_bad_behavior || -1,
      reset_frequency: (initialData?.reset_frequency as any) || "never",
      reset_day: initialData?.reset_day || 1,
      notifications_enabled: initialData?.notifications_enabled ?? true,
      parent_access: (initialData?.parent_access as any) || "view_only",
    },
  });

  const notificationsEnabled = watch("notifications_enabled");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <Label htmlFor="points_per_good_behavior">Points per Good Behavior</Label>
          <Input 
            id="points_per_good_behavior" 
            type="number" 
            {...register("points_per_good_behavior")} 
          />
          <p className="text-xs text-muted-foreground">Default points for positive behaviors</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="points_per_bad_behavior">Points per Bad Behavior</Label>
          <Input 
            id="points_per_bad_behavior" 
            type="number" 
            {...register("points_per_bad_behavior")} 
          />
          <p className="text-xs text-muted-foreground">Default points for negative behaviors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <Label htmlFor="reset_frequency">Reset Frequency</Label>
          <Select id="reset_frequency" {...register("reset_frequency")}>
            <option value="never">Never</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
          <p className="text-xs text-muted-foreground">How often student points are reset</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="reset_day">Reset Day (for Weekly/Monthly)</Label>
          <Input 
            id="reset_day" 
            type="number" 
            min="1" 
            max="31" 
            {...register("reset_day")} 
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="parent_access">Parent Access Level</Label>
        <Select id="parent_access" {...register("parent_access")}>
          <option value="view_only">View Only</option>
          <option value="full_access">Full Access (can message)</option>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="notifications_enabled" 
          checked={notificationsEnabled}
          onCheckedChange={(checked) => setValue("notifications_enabled", checked === true)}
        />
        <Label htmlFor="notifications_enabled">Enable Notifications</Label>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
};
