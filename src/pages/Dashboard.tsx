import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";

const Dashboard: React.FC = () => {
  const { profile, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome, {profile?.fullName}! Your role is {profile?.role}.</p>
      <Button onClick={() => logout()}>Logout</Button>
    </div>
  );
};

export default Dashboard;
