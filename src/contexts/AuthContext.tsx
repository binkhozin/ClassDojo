import React, { createContext, useEffect, useState } from "react";
import { supabase } from "../integrations/supabase";
import { AuthUser, UserProfile, SignUpData, AuthContextType } from "../types";
import { getAuthErrorMessage } from "../lib/authErrors";
import { toast } from "sonner";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await fetchProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        const authUser: AuthUser = {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role,
          avatar_url: data.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        const userProfile: UserProfile = {
          ...authUser,
          schoolName: data.school_name,
          gradeLevel: data.grade_level,
          phone: data.phone,
        };
        setUser(authUser);
        setProfile(userProfile);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Profile is usually created via trigger in Supabase, 
        // but we'll ensure it exists or create it if needed.
        // Assuming we have a trigger, we just wait for verification.
        toast.success("Registration successful! Please check your email for verification.");
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
      toast.error(getAuthErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Logged in successfully!");
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
      toast.error(getAuthErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully!");
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent!");
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPasswordReset = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      setIsLoading(true);
      
      const updateData: any = {};
      if (data.fullName) updateData.full_name = data.fullName;
      if (data.avatar_url) updateData.avatar_url = data.avatar_url;
      if (data.schoolName) updateData.school_name = data.schoolName;
      if (data.gradeLevel) updateData.grade_level = data.gradeLevel;
      if (data.phone) updateData.phone = data.phone;

      // @ts-expect-error Supabase type inference issue with update()
      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;
      
      await fetchProfile(user.id);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        error,
        signUp,
        login,
        logout,
        resetPassword,
        confirmPasswordReset,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
