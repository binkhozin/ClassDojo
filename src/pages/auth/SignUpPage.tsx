import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { signUpSchema } from "../../lib/validations/authSchemas";
import { useSignUp } from "../../hooks/useSignUp";
import { AuthCard } from "../../components/auth/AuthCard";
import { FormError } from "../../components/auth/FormError";
import { RoleSelector } from "../../components/auth/RoleSelector";
import { PasswordStrengthIndicator } from "../../components/auth/PasswordStrengthIndicator";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import * as z from "zod";

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpPage: React.FC = () => {
  const { signUp, isLoading, error } = useSignUp();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "teacher",
      terms: false,
    },
  });

  const selectedRole = watch("role");
  const watchPassword = watch("password", "");

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      await signUp(data);
      // Success is handled in the hook (toast)
      // We don't redirect yet because they need to verify email
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <AuthCard
        title="Create an account"
        description="Join ClassDojo today"
        footer={
          <div className="text-sm text-center w-full">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Who are you?</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <RoleSelector value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              disabled={isLoading}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
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

          {(selectedRole === "teacher" || selectedRole === "admin") && (
            <div className="grid gap-2">
              <Label htmlFor="schoolName">School Name (Optional)</Label>
              <Input
                id="schoolName"
                placeholder="Central High School"
                disabled={isLoading}
                {...register("schoolName")}
              />
            </div>
          )}

          {(selectedRole === "teacher" || selectedRole === "student") && (
            <div className="grid gap-2">
              <Label htmlFor="gradeLevel">Grade Level (Optional)</Label>
              <Input
                id="gradeLevel"
                placeholder="Grade 5"
                disabled={isLoading}
                {...register("gradeLevel")}
              />
            </div>
          )}

          <div className="flex items-center space-x-2 py-2">
            <Controller
              name="terms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
            <Label
              htmlFor="terms"
              className="text-xs text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                terms and conditions
              </Link>
            </Label>
          </div>
          {errors.terms && (
            <p className="text-xs text-destructive mt-1">{errors.terms.message}</p>
          )}

          <FormError message={error || undefined} />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            )}
            Sign Up
          </Button>
        </form>
      </AuthCard>
    </div>
  );
};

export default SignUpPage;
