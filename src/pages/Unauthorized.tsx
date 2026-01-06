import React from "react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

const Unauthorized: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <h1 className="text-4xl font-bold mb-2">Unauthorized</h1>
    <p className="text-muted-foreground mb-6">You do not have permission to access this page.</p>
    <Button asChild>
      <Link to="/dashboard">Back to Dashboard</Link>
    </Button>
  </div>
);

export default Unauthorized;
