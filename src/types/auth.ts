import type { UserRole } from "./database";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar_url?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends AuthUser {
  schoolName?: string | null;
  gradeLevel?: string | null;
  phone?: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  schoolName?: string;
  gradeLevel?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signUp: (data: SignUpData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (password: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}
