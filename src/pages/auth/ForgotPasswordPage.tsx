import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { forgotPasswordSchema } from "../../lib/validations/authSchemas";
import { usePasswordReset } from "../../hooks/usePasswordReset";
import { AuthCard } from "../../components/auth/AuthCard";
import { FormError } from "../../components/auth/FormError";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import * as z from "zod";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, isLoading, error } = usePasswordReset();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
    } catch (err) {
      // Error handled in hook
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
        <AuthCard
          title="Check your email"
          description="We've sent a password reset link to your email address."
          footer={
            <Link to="/login" className="text-sm text-primary hover:underline font-medium w-full text-center">
              Back to login
            </Link>
          }
        >
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                className=" h-6 w-6 text-primary"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect height="16" rx="2" ry="2" width="20" x="2" y="4" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              If you don't receive the email within a few minutes, please check your spam folder.
            </p>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <AuthCard
        title="Forgot password?"
        description="Enter your email address and we'll send you a link to reset your password."
        footer={
          <div className="text-sm text-center w-full">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <FormError message={error || undefined} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            )}
            Send Reset Link
          </Button>
        </form>
      </AuthCard>
    </div>
  );
};

export default ForgotPasswordPage;
