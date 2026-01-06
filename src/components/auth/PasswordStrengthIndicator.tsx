import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface PasswordStrengthIndicatorProps {
  password?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password = "" }) => {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
  ];

  const metCount = requirements.filter((req) => req.met).length;
  
  let strength = "Weak";
  let colorClass = "bg-red-500";
  
  if (metCount === 4) {
    strength = "Strong";
    colorClass = "bg-green-500";
  } else if (metCount >= 2) {
    strength = "Medium";
    colorClass = "bg-yellow-500";
  }

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground font-medium">Password strength: <span className={cn(
          strength === "Strong" ? "text-green-600" : strength === "Medium" ? "text-yellow-600" : "text-red-600"
        )}>{strength}</span></span>
        <span className="text-muted-foreground">{metCount}/4</span>
      </div>
      <div className="grid grid-cols-4 gap-1 h-1 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-full rounded-full transition-colors",
              i <= metCount ? colorClass : "bg-secondary"
            )}
          />
        ))}
      </div>
      <ul className="space-y-1 mt-2">
        {requirements.map((req, idx) => (
          <li key={idx} className="flex items-center text-xs text-muted-foreground">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500 mr-2 shrink-0" />
            ) : (
              <X className="h-3 w-3 text-red-500 mr-2 shrink-0" />
            )}
            <span className={cn(req.met ? "text-foreground" : "")}>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
