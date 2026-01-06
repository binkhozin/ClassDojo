import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl">Welcome to ClassDojo</CardTitle>
              <CardDescription className="text-lg">
                A comprehensive classroom management and behavior tracking system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">For Teachers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage classes, track behavior, and engage with parents
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">For Parents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Stay connected with your child's progress and achievements
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">For Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track your progress, earn rewards, and unlock badges
                    </p>
                  </CardContent>
                </Card>
              </div>

              {!user && (
                <div className="flex gap-4 justify-center">
                  <Button size="lg">Sign In</Button>
                  <Button size="lg" variant="outline">Sign Up</Button>
                </div>
              )}

              {user && (
                <div className="text-center">
                  <p className="text-lg">Welcome back! You're logged in.</p>
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
