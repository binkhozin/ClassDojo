import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-5xl font-extrabold mb-2">ClassDojo</CardTitle>
              <CardDescription className="text-xl">
                A comprehensive classroom management and behavior tracking system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl">For Teachers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage classes, track behavior, and engage with parents
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl">For Parents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Stay connected with your child's progress and achievements
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl">For Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track your progress, earn rewards, and unlock badges
                    </p>
                  </CardContent>
                </Card>
              </div>

              {!user ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" className="w-full sm:w-auto px-12" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-12" asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-xl font-medium">Welcome back, {user.fullName}!</p>
                  <Button size="lg" asChild>
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Project initialized with Vite + React + TypeScript + Supabase</p>
            <p className="mt-2">Database schema includes all tables for complete ClassDojo functionality</p>
          </div>
        </div>
      </div>
    </div>
  );
}
