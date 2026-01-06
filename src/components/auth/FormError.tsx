import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in zoom-in duration-200",
      className
    )}>
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
};
