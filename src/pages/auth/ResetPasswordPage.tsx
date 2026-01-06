import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { resetPasswordSchema } from "../../lib/validations/authSchemas";
import { usePasswordReset } from "../../hooks/usePasswordReset";
import { AuthCard } from "../../components/auth/AuthCard";
import { FormError } from "../../components/auth/FormError";
import { PasswordStrengthIndicator } from "../../components/auth/PasswordStrengthIndicator";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import * as z from "zod";

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const { confirmPasswordReset, isLoading, error } = usePasswordReset();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchPassword = watch("password", "");

  const onSubmit = async (data: ResetPasswordValues) => {
    try {
      await confirmPasswordReset(data.password);
      navigate("/login");
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <AuthCard
        title="Reset your password"
        description="Enter your new password below."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              {...register("password")}
            />
            <PasswordStrengthIndicator password={watchPassword} />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <FormError message={error || undefined} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            )}
            Update Password
          </Button>
        </form>
      </AuthCard>
    </div>
  );
};

export default ResetPasswordPage;
