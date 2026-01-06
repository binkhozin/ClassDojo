import { AuthUser, UserRole } from "../types";

export const requireAuth = (user: AuthUser | null) => {
  return !!user;
};

export const requireRole = (user: AuthUser | null, roles: UserRole[]) => {
  return user && roles.includes(user.role);
};

export const canAccessRoute = (user: AuthUser | null, requiredRoles?: UserRole[]) => {
  if (!requiredRoles) return true;
  return user && requiredRoles.includes(user.role);
};
