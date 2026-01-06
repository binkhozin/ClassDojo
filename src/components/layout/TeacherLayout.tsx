import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Star, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  GraduationCap
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";
import { useLogout } from "../../hooks/useLogout";
import { cn } from "../../lib/utils";
import { NotificationCenter } from "../NotificationCenter";

const TeacherLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
    { name: "Classes", href: "/teacher/classes", icon: GraduationCap, disabled: true },
    { name: "Behavior Log", href: "/teacher/behaviors/log", icon: Star },
    { name: "Behavior History", href: "/teacher/behaviors/history", icon: Star },
    { name: "Leaderboard", href: "/teacher/leaderboard", icon: Star },
    { name: "Performance", href: "/teacher/performance", icon: Star },
    { name: "Rewards", href: "/teacher/rewards", icon: Star },
    { name: "Badges", href: "/teacher/badges", icon: Star },
    { name: "Messages", href: "/teacher/messages", icon: MessageSquare, disabled: true },
    { name: "Settings", href: "/teacher/settings", icon: Settings, disabled: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r">
        <div className="p-6 flex items-center justify-between">
          <Link to="/teacher/dashboard" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">ClassDojo</span>
          </Link>
          <div className="hidden md:block">
            <NotificationCenter />
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
              {user?.user_metadata?.full_name?.charAt(0) || "T"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name || "Teacher"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive" 
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/teacher/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold">ClassDojo</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 top-16 bg-background animate-in slide-in-from-top duration-300">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.disabled ? "#" : item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t mt-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground text-base" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
