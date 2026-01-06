import React from "react";
import { User, Users, GraduationCap, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";
import { UserRole } from "../../types";

interface RoleOption {
  value: UserRole;
  label: string;
  icon: React.ElementType;
  description: string;
}

const roles: RoleOption[] = [
  {
    value: "teacher",
    label: "Teacher",
    icon: GraduationCap,
    description: "Create classes and manage students.",
  },
  {
    value: "parent",
    label: "Parent",
    icon: Users,
    description: "Connect with your child's classroom.",
  },
  {
    value: "student",
    label: "Student",
    icon: User,
    description: "Learn and earn points for behavior.",
  },
  {
    value: "admin",
    label: "Admin",
    icon: ShieldCheck,
    description: "Full access to school management.",
  },
];

interface RoleSelectorProps {
  value: UserRole | "";
  onChange: (value: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {roles.map((role) => (
        <button
          key={role.value}
          type="button"
          onClick={() => onChange(role.value)}
          className={cn(
            "flex flex-col items-center p-4 border rounded-lg text-center transition-all hover:bg-accent hover:border-accent-foreground/20",
            value === role.value
              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
              : "border-input bg-card"
          )}
        >
          <role.icon className={cn(
            "h-6 w-6 mb-2",
            value === role.value ? "text-primary" : "text-muted-foreground"
          )} />
          <span className="font-semibold text-sm">{role.label}</span>
          <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
            {role.description}
          </p>
        </button>
      ))}
    </div>
  );
};
