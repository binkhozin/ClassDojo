import { AuthError } from "@supabase/supabase-js";

export const getAuthErrorMessage = (error: AuthError | Error | string): string => {
  if (typeof error === "string") return error;

  if (error instanceof AuthError) {
    switch (error.status) {
      case 400:
        if (error.message.includes("invalid_credentials")) {
          return "Invalid email or password. Please try again.";
        }
        if (error.message.includes("User already registered")) {
          return "An account with this email already exists.";
        }
        break;
      case 422:
        if (error.message.includes("Password should be at least")) {
          return "Password is too weak. Please use a stronger password.";
        }
        break;
      case 429:
        return "Too many requests. Please try again later.";
    }

    // Specific message handling
    if (error.message.includes("Email not confirmed")) {
      return "Please verify your email address before logging in.";
    }
    
    if (error.message.includes("Invalid login credentials")) {
        return "Invalid email or password. Please try again.";
    }
  }

  return error.message || "An unexpected error occurred during authentication.";
};
